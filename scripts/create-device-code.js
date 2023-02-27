const dotenv = require("dotenv");
const { v4: uuid } = require("uuid");

dotenv.config();

// https://developer.squareup.com/explorer/square/locations-api/list-locations
const { SQUARE_ACCESS_TOKEN, LOCATION_ID } = process.env;

(async () => {
  // https://developer.squareup.com/explorer/square/devices-api/create-device-code
  const response = await fetch(
    "https://connect.squareup.com/v2/devices/codes",
    {
      method: "POST",
      headers: {
        "Square-Version": "2023-01-19",
        Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idempotency_key: uuid(),
        device_code: {
          product_type: "TERMINAL_API",
          location_id: LOCATION_ID,
          name: "Kiosk 1 Terminal",
        },
      }),
    }
  );

  console.log(await response.json());
})();
