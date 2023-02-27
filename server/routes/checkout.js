import express from "express";
import BookingDto from "../dtos/booking.js";
import Booking from "../models/booking.js";
import ExperiencePrice from "../models/experience-price.js";
import Experience from "../models/experience.js";
import Location from "../models/location.js";
import { HttpError } from "../utils/errors.js";
import { list } from "../utils/localization.js";
import { createPaymentLink, createTerminalCheckout } from "../utils/square.js";

const checkoutRouter = express.Router();

checkoutRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  const bookings = await Booking.findAll({
    where: {
      squareOrderId: id,
    },
    include: ["stations"],
  });

  if (bookings.find((b) => !b.isComplete)) {
    res.json({ isComplete: false });
  } else {
    res.json({
      isComplete: true,
      message: `Booking complete! You will receive a receipt and booking confirmation via email. Your experience(s) at ${list(
        [
          ...new Set(
            bookings.map(({ stations }) => stations.map((s) => s.name)).flat()
          ),
        ]
      )} will start at ${bookings[0].startTime.toLocaleString("ja-JP", {
        dateStyle: "medium",
        timeStyle: "short",
        hourCycle: "h23",
      })}. Please check in at the in-store kiosk up to 5 minutes in advance.`,
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

  const location = await Location.findByPk(bookingStations[0].location.id);
  if (!location) {
    throw new Error(`Location with ID "${locationId}" not found.`);
  }

  const experiences = await Experience.findAll();
  if (!experiences || !experiences.length) {
    throw new Error(`No Experiences found.`);
  }

  const experiencePrices = await ExperiencePrice.findAll();
  if (!experiencePrices || !experiencePrices.length) {
    throw new Error(`No ExperiencePrices found.`);
  }

  const data = isPos
    ? await createTerminalCheckout({ bookingStations, experiencePrices })
    : await createPaymentLink({
        location,
        experiencePrices,
        bookingStations,
        referrer,
      });
  const orderId = isPos ? data.checkout.id : data.payment_link.order_id;

  // Creating the bookings in a pending state...
  await Booking.bulkCreate(
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
            isCheckedIn: false,
            squareOrderId: orderId,
            bookingStations: [
              ...(byLocation[bs.location.id]?.bookingStations || []),
              {
                experiencePriceId: bs.experiencePrice.id,
                locationId: bs.location.id,
                stationId: bs.stationId,
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
