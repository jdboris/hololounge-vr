const ORDER_ID = "12345";

console.log(
  await (
    await fetch(`http://localhost:5000/api/square/terminal-checkout-updated`, {
      method: "POST",
      body: JSON.stringify({
        merchant_id: "ML43FXN428RYQ",
        type: "terminal.checkout.updated",
        event_id: "2e64e79e-99e9-316f-9e47-ca4f9ec9cfec",
        created_at: "2023-03-15T08:37:53.787Z",
        data: {
          type: "checkout.event",
          id: ORDER_ID,
          object: {
            checkout: {
              amount_money: { amount: 2000, currency: "JPY" },
              app_id: "sq0idp-Yq3vXny_bktGivmXjfT9_g",
              created_at: "2023-03-15T08:37:44.514Z",
              deadline_duration: "PT5M",
              device_options: {
                collect_signature: false,
                device_id: "245CS145B3000938",
                skip_receipt_screen: false,
                tip_settings: { allow_tipping: false },
              },
              id: ORDER_ID,
              location_id: "LY541V0M6N2WW",
              payment_ids: ["3PMpSD8nsFTAsJXCXEyVjyL1vaB"],
              payment_options: { autocomplete: true },
              payment_type: "CARD_PRESENT",
              status: "COMPLETED",
              updated_at: "2023-03-15T08:37:53.787Z",
            },
          },
        },
      }),
    })
  ).json()
);
