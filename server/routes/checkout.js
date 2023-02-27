import express from "express";
import BookingDto from "../dtos/booking.js";
import Booking from "../models/booking.js";
import ExperiencePrice from "../models/experience-price.js";
import Experience from "../models/experience.js";
import Location from "../models/location.js";
import { HttpError } from "../utils/errors.js";
import { createPaymentLink, createTerminalCheckout } from "../utils/square.js";

const checkoutRouter = express.Router();

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
    ? await createTerminalCheckout()
    : await createPaymentLink();
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
    });
  } else {
    res.json({
      message: "Redirecting for checkout...",
      redirectUrl: data.payment_link.url,
    });
  }
});

export default checkoutRouter;
