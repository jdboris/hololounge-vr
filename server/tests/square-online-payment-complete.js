const ORDER_ID = "12345";

console.log(
  await (
    await fetch(`http://localhost:5000/api/square/payment-updated`, {
      method: "POST",
      body: JSON.stringify({
        merchant_id: "ML6PT9F9F2KE8",
        type: "payment.updated",
        event_id: "71954683-53c7-46ab-bd3b-cc8385811404",
        created_at: "2023-02-20T09:06:58.629685258Z",
        data: {
          type: "payment",
          id: "KkAkhdMsgzn59SM8A89WgKwekxLZY",
          object: {
            payment: {
              amount_money: {
                amount: 100,
                currency: "USD",
              },
              approved_money: {
                amount: 100,
                currency: "USD",
              },
              card_details: {
                avs_status: "AVS_ACCEPTED",
                card: {
                  bin: "540988",
                  card_brand: "MASTERCARD",
                  card_type: "CREDIT",
                  exp_month: 11,
                  exp_year: 2022,
                  fingerprint:
                    "sq-1-Tvruf3vPQxlvI6n0IcKYfBukrcv6IqWr8UyBdViWXU2yzGn5VMJvrsHMKpINMhPmVg",
                  last_4: "9029",
                  prepaid_type: "NOT_PREPAID",
                },
                card_payment_timeline: {
                  authorized_at: "2020-11-22T21:16:51.198Z",
                  captured_at: "2020-11-22T21:19:00.832Z",
                },
                cvv_status: "CVV_ACCEPTED",
                entry_method: "KEYED",
                statement_description: "SQ *DEFAULT TEST ACCOUNT",
                status: "CAPTURED",
              },
              created_at: "2020-11-22T21:16:51.086Z",
              delay_action: "CANCEL",
              delay_duration: "PT168H",
              delayed_until: "2020-11-29T21:16:51.086Z",
              id: "hYy9pRFVxpDsO1FB05SunFWUe9JZY",
              location_id: "S8GWD5R9QB376",
              order_id: ORDER_ID,
              receipt_number: "hYy9",
              receipt_url:
                "https://squareup.com/receipt/preview/hYy9pRFVxpDsO1FB05SunFWU11111",
              risk_evaluation: {
                created_at: "2020-11-22T21:16:51.198Z",
                risk_level: "NORMAL",
              },
              source_type: "CARD",
              status: "COMPLETED",
              total_money: {
                amount: 100,
                currency: "USD",
              },
              updated_at: "2020-11-22T21:19:00.831Z",
              version_token: "bhC3b8qKJvNDdxqKzXaeDsAjS1oMFuAKxGgT32HbE6S6o",
            },
          },
        },
      }),
    })
  ).json()
);
