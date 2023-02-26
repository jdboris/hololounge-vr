console.log(
  await (
    await fetch(`http://localhost:5000/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startTime: "2023-02-26T12:00:00Z",
        birthday: "1993-05-17T00:00:00Z",
        firstName: "Joseph",
        lastName: "Boris",
        email: "jdboris@yahoo.com",
        phone: "5134778642",
        bookingStations: [
          {
            location: { id: "2ce14320-90cf-11ed-b97c-b18070c059f2" },
            stationId: "05b0bcc0-b1b6-11ed-91ba-d3a38ee96c46",
            experiencePrice: {
              experience: { id: "123" },
              id: "4a358b70-90f7-11ed-aeaa-fff9fed87450",
              idInSquare: "Z23CMMI5LMMQG3NFMUNNZYO4",
              duration: 60,
              price: "3000",
              createdAt: "2023-02-19T07:32:40.000Z",
              updatedAt: "2023-02-19T07:32:40.000Z",
              experienceId: "2ce3ff70-90cf-11ed-812b-f1fd48c47c53",
            },
          },
          {
            location: { id: "ec5b3b80-b1dc-11ed-948a-7bde5af54401" },
            stationId: "968b1e50-b1dd-11ed-9d99-af3f95da79af",
            experiencePrice: {
              experience: { id: "123" },
              id: "0246b240-b200-11ed-bef2-8189daa72698",
              idInSquare: "Z23CMMI5LMMQG3NFMUNNZYO4",
              duration: 60,
              price: "3000",
              createdAt: "2023-02-19T07:32:40.000Z",
              updatedAt: "2023-02-19T07:32:40.000Z",
              experienceId: "ec5f2f40-b1dc-11ed-937e-37b3d165f19e",
            },
          },
          {
            location: { id: "ec5b3b80-b1dc-11ed-948a-7bde5af54401" },
            stationId: "123",
            experiencePrice: {
              experience: { id: "123" },
              id: "0246b240-b200-11ed-bef2-8189daa72698",
              idInSquare: "Z23CMMI5LMMQG3NFMUNNZYO4",
              duration: 60,
              price: "3000",
              createdAt: "2023-02-19T07:32:40.000Z",
              updatedAt: "2023-02-19T07:32:40.000Z",
              experienceId: "ec5f2f40-b1dc-11ed-937e-37b3d165f19e",
            },
          },
          {
            location: { id: "1234" },
            stationId: "234",
            experiencePrice: {
              experience: { id: "123" },
              id: "0246b240-b200-11ed-bef2-8189daa72698",
              idInSquare: "Z23CMMI5LMMQG3NFMUNNZYO4",
              duration: 60,
              price: "3000",
              createdAt: "2023-02-19T07:32:40.000Z",
              updatedAt: "2023-02-19T07:32:40.000Z",
              experienceId: "ec5f2f40-b1dc-11ed-937e-37b3d165f19e",
            },
          },
          {
            location: { id: "2ce14320-90cf-11ed-b97c-b18070c059f2" },
            stationId: "345",
            experiencePrice: {
              experience: { id: "123" },
              id: "4a358b70-90f7-11ed-aeaa-fff9fed87450",
              idInSquare: "Z23CMMI5LMMQG3NFMUNNZYO4",
              duration: 60,
              price: "3000",
              createdAt: "2023-02-19T07:32:40.000Z",
              updatedAt: "2023-02-19T07:32:40.000Z",
              experienceId: "2ce3ff70-90cf-11ed-812b-f1fd48c47c53",
            },
          },
        ],
      }),
    })
  ).json()
);
