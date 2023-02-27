import * as dotenv from "dotenv";
import { v4 as uuid } from "uuid";

dotenv.config();
const {
  SQUARE_CREATE_TERMINAL_CHECKOUT_URL,
  SQUARE_TERMINAL_1_DEVICE_ID,
  SQUARE_CREATE_PAYMENT_LINK_URL,
  SQUARE_ACCESS_TOKEN,
} = process.env;

export async function createTerminalCheckout({
  bookingStations,
  experiencePrices,
}) {
  const total = bookingStations.reduce(
    (total, bs) =>
      total +
      Number(
        experiencePrices.find((ep) => ep.id == bs.experiencePrice.id).price
      ),
    0
  );

  const response = await fetch(SQUARE_CREATE_TERMINAL_CHECKOUT_URL, {
    method: "POST",
    headers: {
      "Square-Version": "2023-01-19",
      Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idempotency_key: uuid(),
      checkout: {
        amount_money: {
          amount: total,
          currency: "JPY",
        },
        payment_options: {},
        device_options: {
          device_id: SQUARE_TERMINAL_1_DEVICE_ID,
        },
      },
    }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
}

export async function createPaymentLink({
  location,
  experiencePrices,
  bookingStations,
  referrer,
}) {
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
        redirect_url: referrer.href,
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
  const data = await response.json();

  if (!response.ok) {
    console.error(data);
    throw data;
  }

  if (!data.payment_link.url) {
    console.error(data);
    throw new Error("No checkout URL.");
  }

  return data;
}
