import { formatISO } from "date-fns";
import * as dotenv from "dotenv";
import express from "express";
import { v4 as uuid } from "uuid";
import BookingDto from "../dtos/booking.js";
import BookingStation from "../models/booking-station.js";
import Booking from "../models/booking.js";
import ExperiencePrice from "../models/experience-price.js";
import Experience from "../models/experience.js";
import Location from "../models/location.js";
import Station from "../models/station.js";
import { HttpError } from "../utils/errors.js";

dotenv.config();
const { SQUARE_CREATE_PAYMENT_LINK_URL, SQUARE_ACCESS_TOKEN } = process.env;

const checkoutRouter = express.Router();

checkoutRouter.post("/", async (req, res) => {
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
    location: { id: locationId },
    bookingStations,
    startTime,
    birthday,
    firstName,
    lastName,
    email,
    phone,
  } = req.body;

  const location = await Location.findByPk(locationId);
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

  const response = await fetch(SQUARE_CREATE_PAYMENT_LINK_URL, {
    method: "POST",
    headers: {
      "Square-Version": "2023-01-19",
      Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      order: {
        location_id: location.idInSquare,
        // Reduce the bookingStations to an array of line item objects grouped by idInSquare
        line_items: Object.values(
          bookingStations.reduce((items, bs) => {
            const { idInSquare } = experiencePrices.find(
              (ep) => ep.id == bs.experiencePrice.id
            );

            return {
              ...items,
              [idInSquare]: {
                catalog_object_id: idInSquare,
                quantity: String(
                  (Number(items[idInSquare]?.quantity) || 0) + 1
                ),
                item_type: "ITEM",
              },
            };
          }, {})
        ),
      },
      checkout_options: {
        redirect_url: "https://hololounge.jp",
        accepted_payment_methods: {
          apple_pay: true,
          cash_app_pay: true,
          google_pay: true,
          afterpay_clearpay: true,
        },
      },
      idempotency_key: uuid(),
      // NOTE: At this time, pre-populating the Square checkout page is insufficient
      // pre_populated_data: {
      //   buyer_email: email,
      //   buyer_phone_number: phone,
      // },
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw data;
  }

  const data = await response.json();

  if (!data.payment_link.url) {
    console.log(data);
    throw new Error("No checkout URL.");
  }

  // Creating the booking in a pending state...
  const booking = await Booking.create({
    startTime,
    birthday,
    lastName,
    firstName,
    email,
    phone,
    locationId: location.id,
    isComplete: false,
    squareOrderId: data.payment_link.order_id,
  });

  await BookingStation.bulkCreate(
    bookingStations.map((bs) => ({
      bookingId: booking.id,
      stationId: bs.stationId,
      experiencePriceId: bs.experiencePrice.id,
    }))
  );

  res.json({
    message: "Redirecting for checkout...",
    url: data.payment_link.url,
  });
});

export default checkoutRouter;
