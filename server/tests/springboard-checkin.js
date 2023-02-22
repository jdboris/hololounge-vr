const BOOKING_ID = "833789f0-b2d5-11ed-848f-1bc3ab82dfd3";

console.log(
  await (
    await fetch(`http://localhost:5000/api/bookings/${BOOKING_ID}/checkin`, {
      method: "POST",
    })
  ).json()
);
