import { addMinutes, subMinutes } from "date-fns";
import express from "express";
import { col, fn, Op, where } from "sequelize";
import BookingDto from "../dtos/booking.js";
import Booking from "../models/booking.js";
import ExperiencePrice from "../models/experience-price.js";
import Experience from "../models/experience.js";
import Location from "../models/location.js";
import { HttpError } from "../utils/errors.js";
import { createPaymentLink, createTerminalCheckout } from "../utils/square.js";

import * as dotenv from "dotenv";

dotenv.config();
const BOOKING_MARGIN = Number(process.env.BOOKING_MARGIN);

const checkoutRouter = express.Router();

checkoutRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  const bookings = await Booking.findAll({
    where: {
      squareOrderId: id,
    },
    include: ["stations"],
  });

  if (!bookings.length) {
    throw new HttpError(`No bookings found with ID "${id}".`, 404);
  } else if (bookings.find((b) => b.isCanceled)) {
    res.json({ isCanceled: true });
  } else if (bookings.find((b) => !b.isComplete)) {
    res.json({ isComplete: false });
  } else {
    res.json({
      isComplete: true,
      message: `Booking complete! You will receive a receipt and booking confirmation via email. Please check in at the in-store kiosk up to ${BOOKING_MARGIN} minutes in advance.`,
      bookings,
    });
  }
});

checkoutRouter.post("/", async (req, res) => {
  const referrer = new URL(req.headers.referer);
  const isPos = /^\/pos\/|^\/pos$/.test(referrer.pathname);

  try {
    // Instantiate a DTO for parsing/validation
    req.body = new BookingDto(req.body);
  } catch (error) {
    throw new HttpError(error.message, 400, error.details);
  }

  /**
   * @type BookingDto
   */
  const {
    bookingStations,
    startTime,
    birthday,
    firstName,
    lastName,
    email,
    phone,
  } = req.body;

  const experiencePrices = await ExperiencePrice.findAll();
  if (!experiencePrices || !experiencePrices.length) {
    throw new Error(`No ExperiencePrices found.`);
  }

  const sameStationBookings = await Booking.findAll({
    include: [
      "stations",
      {
        association: "bookingStations",
        include: [
          "location",
          { association: "experiencePrice", include: ["experience"] },
        ],
      },
    ],
    where: {
      "$stations.id$": {
        [Op.in]: bookingStations.map((bs) => bs.stationId),
      },
      isCanceled: false,
      // Either already complete or "pending" (recent)
      [Op.or]: {
        isComplete: true,
        createdAt: { [Op.gt]: subMinutes(new Date(), BOOKING_MARGIN) },
      },

      [Op.and]: [
        // THIS ONE OVERLAPS WITH NEW ONE:

        where(
          // this end
          // fn(
          //   "ADDTIME",
          //   col("startTime"),
          //   fn(
          //     "SEC_TO_TIME",
          //     where(col("bookingStations.experiencePrice.duration"), "*", 60)
          //   )
          // ),
          col("bookingStations.endTime"),
          // >
          Op.gt,
          // new start
          startTime
        ),

        where(
          // this start
          col("bookingStations.startTime"),
          // <
          Op.lt,
          // new end
          addMinutes(
            startTime,
            experiencePrices.find(
              // NOTE: Assuming that all bookingStations are the same duration
              (ep) => ep.id == bookingStations[0].experiencePrice.id
            ).duration + BOOKING_MARGIN
          )
        ),
      ],
    },
  });

  if (sameStationBookings.length) {
    throw new HttpError(
      `Selected station(s) already booked at that time.`,
      400
    );
  }

  const location = await Location.findByPk(bookingStations[0].location.id);
  if (!location) {
    throw new Error(`Location with ID "${locationId}" not found.`);
  }

  const experiences = await Experience.findAll();
  if (!experiences || !experiences.length) {
    throw new Error(`No Experiences found.`);
  }

  // Creating the bookings in a pending state...
  const bookings = await Booking.bulkCreate(
    Object.values(
      bookingStations.reduce(
        (byLocation, bs) => ({
          ...byLocation,
          [bs.location.id]: {
            startTime,
            birthday,
            lastName,
            firstName,
            email,
            phone,
            locationId: bs.location.id,
            isComplete: false,
            isCanceled: false,
            isCheckedIn: false,
            squareOrderId: null,
            bookingStations: [
              ...(byLocation[bs.location.id]?.bookingStations || []),
              {
                experiencePriceId: bs.experiencePrice.id,
                locationId: bs.location.id,
                stationId: bs.stationId,
                startTime,
                endTime: addMinutes(
                  startTime,
                  bs.experiencePrice.duration + BOOKING_MARGIN
                ),
              },
            ],
          },
        }),
        {}
      )
    ),
    {
      include: ["bookingStations"],
    }
  );

  const data =
    process.env.NODE_ENV == "production"
      ? isPos
        ? await createTerminalCheckout({ bookingStations, experiencePrices })
        : await createPaymentLink({
            location,
            experiencePrices,
            bookingStations,
            referrer,
          })
      : {
          checkout: { id: "12345" },
          payment_link: { order_id: "12345", url: "#" },
        };
  const orderId = isPos ? data.checkout.id : data.payment_link.order_id;

  Booking.update(
    { squareOrderId: orderId },
    {
      where: {
        id: {
          [Op.in]: bookings.map((b) => b.id),
        },
      },
    }
  );

  if (isPos) {
    res.json({
      message:
        "Please continue to the payment terminal to complete your order...",
      id: orderId,
    });
  } else {
    res.json({
      message: "Redirecting for checkout...",
      redirectUrl: data.payment_link.url,
    });
  }
});

export default checkoutRouter;
