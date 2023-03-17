import { v4 as uuid } from "uuid";
const { SPRINGBOARD_EMAIL, SPRINGBOARD_PASSWORD } = process.env;

export async function checkIn(bookingId, token) {
  const body = JSON.stringify({
    query: `
      mutation storeBooking($booking: BookingInput) {
        storeBooking(booking: $booking) {
          id
          title
          startTime
          deletedAt
          updatedAt
          checkedInAt
          numPlayers
          notifyHost
          notes
          host {
            id
            firstName
            lastName
            phone
            email
            birthday
            cards {
              id
              lastFour
            }
          }
          location {
            id
            waiversRequired
          }
          waiverNumSurprisedGuests
          waiverNumMinors
          waiverNumSigned
          waiverReferenceHost
          createdAt
          imageUrl
          bookingStationTimes {
            id
            experience {
              id
            }
            station {
              id
            }
            tier {
              id
              length
              price
            }
            startedAt
            endTime
            amountDue
            amountPaid
            pausedAt
            pausedDuration
            discount {
              id
            }
            coupon {
              id
            }
            customerCard {
              id
              lastFour
            }
            createdAt
          }
        }
      }
    `,
    variables: {
      booking: {
        id: bookingId,
        checkedInAt: new Date().toISOString(),
      },
    },
  });

  const response = await fetch(`https://api.springboardvr.com/graphql`, {
    method: "POST",
    headers: {
      authority: "api.springboardvr.com",
      method: "POST",
      path: "/graphql",
      scheme: "https",
      accept: "*/*",
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "en-US",
      authorization: `Bearer ${token}`,
      "content-length": new Blob([body]).size,
      "content-type": "application/json",
      origin: "https://monitor.springboardvr.com",
      referer: "https://monitor.springboardvr.com/",
      "sec-ch-ua":
        '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
      "x-tenant-id": "1",
      "x-transaction-id": uuid(),
    },
    body,
  });

  const data = await response.json();

  if (!response.ok || (data.errors && data.errors.length)) {
    console.error("response body: ", JSON.stringify(data));
    throw new Error(
      `Springboard checkin failed with status ${response.status}`
    );
  }

  return data.data.storeBooking;
}

export async function startBookingStationTime(bookingStationTime, token) {
  const body = JSON.stringify({
    query: `mutation storeBookingStationTime ($bookingStationTime: BookingStationTimeInput) {
  storeBookingStationTime (bookingStationTime: $bookingStationTime) {
    id
    experience {
      id
    }
    station {
      id
    }
    tier {
      id
      length
      price
    }
    startedAt
    endTime
    amountDue
    amountPaid
    pausedAt
    pausedDuration
    discount {
      id
    }
    coupon {
      id
    }
    customerCard {
      id
      lastFour
    }
    createdAt
  }
}`,
    variables: {
      bookingStationTime: {
        id: bookingStationTime.id,
        startedAt: new Date().toISOString(),
        station: { id: bookingStationTime.station.id },
      },
    },
  });

  const response = await fetch(`https://api.springboardvr.com/graphql`, {
    method: "POST",
    headers: {
      authority: "api.springboardvr.com",
      method: "POST",
      path: "/graphql",
      scheme: "https",
      accept: "*/*",
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "en-US",
      authorization: `Bearer ${token}`,
      "content-length": new Blob([body]).size,
      "content-type": "application/json",
      origin: "https://monitor.springboardvr.com",
      referer: "https://monitor.springboardvr.com/",
      "sec-ch-ua":
        '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
      "x-tenant-id": "1",
      "x-transaction-id": uuid(),
    },
    body,
  });

  if (!response.ok) {
    console.log("response body: ", await response.text());
    throw new Error(
      `Springboard station time start failed with status ${response.status}`
    );
  }

  return await response.json();
}

async function getToken() {
  const body = JSON.stringify({
    query: `
    mutation (
      $email: String
      $password: String
      ) {
        user: authenticateUser (
          email: $email
          password: $password
          ) {
            id
            token
            redirectOnLoginUrl
            organization {
              name
              type
              tenantId
            }
          }
        }
    `,
    variables: {
      email: SPRINGBOARD_EMAIL,
      password: SPRINGBOARD_PASSWORD,
    },
  });

  const response = await fetch(`https://api.springboardvr.com/graphql`, {
    method: "POST",
    headers: {
      authority: "api.springboardvr.com",
      method: "POST",
      path: "/graphql",
      scheme: "https",
      accept: "*/*",
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "en-US",
      "content-length": new Blob([body]).size,
      "content-type": "application/json",
      dnt: "1",
      origin: "https://account.springboardvr.com",
      referer: "https://account.springboardvr.com/",
      "sec-ch-ua":
        '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
      "x-requested-with": "XMLHttpRequest",
      "x-transaction-id": uuid(),
    },
    body,
  });

  if (!response.ok) {
    console.log("response body: ", await response.text());
    throw new Error(
      `Springboard token query responded with status ${response.status}`
    );
  }

  const {
    data: {
      user: { token },
    },
  } = await response.json();

  return [token, response.headers.get("set-cookie")];
}

export async function login() {
  const [token, cookies] = await getToken();

  const body = JSON.stringify({
    token: token,
    tenantId: "1",
    env: "production",
    domain: ".springboardvr.com",
  });

  const response = await fetch(`https://api.springboardvr.com/v1/auth/login`, {
    method: "POST",
    headers: {
      authority: "api.springboardvr.com",
      method: "POST",
      path: "/v1/auth/login",
      scheme: "https",
      accept: "*/*",
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "en-US,en;q=0.9",
      "content-length": new Blob([body]).size,
      "content-type": "application/json",
      cookie: cookies,
      dnt: "1",
      origin: "https://account.springboardvr.com",
      referer: "https://account.springboardvr.com/",
      "sec-ch-ua":
        '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
    },
    body,
  });

  if (!response.ok) {
    console.log("response body: ", await response.text());
    throw new Error(
      `Springboard login request responded with status ${response.status}`
    );
  }

  const data = await response.json();
  return data.token;
}
