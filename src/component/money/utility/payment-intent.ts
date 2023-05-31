


// /// import

// // import env from "vne";
// import opennode from "opennode";
// import Stripe from "stripe";
// // import type { NodeJS } from "@types/node";

// /// util

// import { environment, keyOpenNode } from "src/utility/index.ts";
// import type { LooseObject } from "src/utility/index.ts";

// interface OpenNodeChargeInput {
//   amount: number;
//   auto_settle?: boolean;   /// convert to merchant's currency (needs Bank account enabled)
//   callback_url?: string;   /// URL to receive webhooks
//   currency?: string;       /// charge's currency
//   customer_email?: string; /// customer's email
//   customer_name?: string;  /// customer's name
//   description?: string;    /// charge's description
//   notif_email?: string;    /// email to send payment receipt (customer)
//   order_id?: string;       /// merchant's internal order ID
//   success_url?: string;    /// URL to redirect user after payment
//   /// https://developers.opennode.com/reference/create-charge
// }

// opennode.setCredentials(
//   keyOpenNode,
//   environment === "development" ?
//     "dev" :
//     "live"
// );

// // import { SearchRequest } from "~service/search";
// // const { keyOpenNode } = env();
// // const stripe = new Stripe(stripeKey.secret, { apiVersion: "2020-08-27" });



// /// export

// // const calculateOrderAmount = items => {
// //   // Replace this constant with a calculation of the order's amount
// //   // Calculate the order total on the server to prevent
// //   // people from directly manipulating the amount on the client
// //   return 1400;
// // };

// function generateDescription(input: number) {
//   return `${input} domain${input === 1 ? "" : "s"}`;
// }

// export default async(input) => { /// input: ChargeInput
//   // TODO (expect)
//   // : cart/bag
//   // : promo/coupon
//   // : customer data (session)

//   const { cart/*, payment*/ } = input;

//   // console.log(cart);
//   // console.log(payment);
//   // console.log("");

//   // HANDSHAKE
//   // : enter Handshake address and validate
//   // : query blockchain for balance
//   //   : will need API to be running hsd?
//   //
//   // : niami/
//   // : blockexplorer.com

//   // TODO
//   // : get cart contents
//   //   : check availability
//   //   : calculate pricing
//   // : get Stripe payment details ... card?
//   // : get customer info

//   // const {
//   //   amount,
//   //   auto_settle,
//   //   callback_url,
//   //   currency,
//   //   customer_email,
//   //   customer_name,
//   //   description,
//   //   notif_email,
//   //   order_id,
//   //   success_url
//   // } = input;

//   // const charge = {
//   //   amount: 10.5,
//   //   auto_settle: false,
//   //   callback_url: "https://example.com/webhook/opennode",
//   //   currency: "USD"
//   // };

//   const charge: LooseObject = {
//     auto_settle: true,
//     currency: "USD",
//     description: generateDescription(cart.length)
//   };

//   // Object.entries(input).forEach(([key, value]) => {
//   //   if (key === "currency")
//   //     return; /// ignore

//   //   charge[key] = value;
//   // });

//   charge.amount = 23.45;

//   // const charge = {
//   //   amount: 10.5, // required
//   //   auto_settle: false, // convert to merchant's currency (needs Bank account enabled)
//   //   // callback_url: "https://example.com/webhook/opennode", // URL to receive webhooks
//   //   // currency: "USD", // charge's currency
//   //   customer_email: "me@johndoe.com", // customer's email
//   //   customer_name: "John Doe", // customer's name
//   //   description: "My test charge", // charge's description
//   //   notif_email: "me@johndoe.com", // email to send payment receipt (customer)
//   //   order_id: "823320", // merchant's internal order ID
//   //   success_url: "https://example.com/order/abc123" // URL to redirect user after payment
//   // };

//   try {
//     const response = await opennode.createCharge(charge);

//     /*
//       /// response
//       {
//         address: '2Mugj8JPKP6ttsWfocVieAQUYjfyTYEUre5',
//         amount: 51088,
//         auto_settle: false,
//         callback_url: null,
//         chain_invoice: { address: '2Mugj8JPKP6ttsWfocVieAQUYjfyTYEUre5' },
//         created_at: 1639982367,
//         currency: 'USD',
//         description: 'N/A',
//         fiat_value: 23.45,
//         id: '92db1678-9c7c-48ff-8709-a8cfa0a29038',
//         lightning_invoice: {
//           expires_at: 1639982965,
//           payreq: 'lntb510880n1psuqfg7pp5ylkt9emxveavvnafe9d03s0a5wvgx7j9ewkj84n285ujfknpfy7qdq9fch5zcqzpgxqzjhsp5ps05q2n7rf4sd9hzn0as7gc4769e294zr4h9qgsazezvf79kuhhs9qyyssqfln60ztzynudmv79t42st6f3j9knq4u6nc9qpjr5empvn4yyrgl9pvg27hr6ce5zy47z4h7kte34l3xkvy44mafdes74x0xutltvmugqpq2rhm'
//         },
//         metadata: {},
//         notif_email: null,
//         order_id: null,
//         source_fiat_value: 23.45,
//         status: 'unpaid',
//         success_url: null,
//         ttl: 1440,
//         uri: 'bitcoin:2Mugj8JPKP6ttsWfocVieAQUYjfyTYEUre5?amount=0.00051088&label=N/A&lightning=lntb510880n1psuqfg7pp5ylkt9emxveavvnafe9d03s0a5wvgx7j9ewkj84n285ujfknpfy7qdq9fch5zcqzpgxqzjhsp5ps05q2n7rf4sd9hzn0as7gc4769e294zr4h9qgsazezvf79kuhhs9qyyssqfln60ztzynudmv79t42st6f3j9knq4u6nc9qpjr5empvn4yyrgl9pvg27hr6ce5zy47z4h7kte34l3xkvy44mafdes74x0xutltvmugqpq2rhm'
//       }
//     */

//     // TODO
//     // : use `uri` to create QR code for BTC payment

//     // TODO
//     // : return URL based on environment
//     //   : Development - https://dev-checkout.opennode.com/{id}
//     //   : Production -https://checkout.opennode.com/{id}

//     console.log(response);
//     console.log(">>> response");
//   }
//   catch(error: any) {
//     console.error(`${error.status} | ${error.message}`);
//   }

//   // const paymentIntent = await stripe.paymentIntents.create({
//   //   // https://stripe.com/docs/api/payment_intents/create
//   //   amount: 2000, /// amount: req.body.amount * 100
//   //   confirm: true,
//   //   currency: "usd",
//   //   // customer: "", /// id of customer | customer.stripeId
//   //   // description: "", /// # domain(s) for email@example.com
//   //   // metadata: {},
//   //   payment_method_types: ["card"]
//   //   // receipt_email: "email@example.com" /// don't need this, we'll send our own receipts
//   // });

//   // const paymentIntent = await stripe.charges.create({
//   //   amount: 2000,
//   //   currency: "usd",
//   //   // customer: "", /// id of customer
//   //   // description: "", /// # domain(s) for email@example.com
//   //   // metadata: {
//   //   //   "order_id": "6735"
//   //   // },
//   //   // receipt_email: "email@example.com"
//   //   // source: "tok_amex" // obtained with Stripe.js
//   // });

//   // console.log(paymentIntent);
//   // console.log(">>> paymentIntent");

//   /*
//     - amount
//     - created
//     - id
//     - receipt_email

//     - charges
//     - customer
//     - description
//     - metadata

//     {
//       id: 'pi_3K4YaYBSK7CzLVcG1iYlcoPa',
//       object: 'payment_intent',
//       amount: 1000,
//       amount_capturable: 0,
//       amount_received: 0,
//       application: null,
//       application_fee_amount: null,
//       automatic_payment_methods: null,
//       canceled_at: null,
//       cancellation_reason: null,
//       capture_method: 'automatic',
//       charges: {
//         object: 'list',
//         data: [],
//         has_more: false,
//         total_count: 0,
//         url: '/v1/charges?payment_intent=pi_3K4YaYBSK7CzLVcG1iYlcoPa'
//       },
//       client_secret: 'pi_3K4YaYBSK7CzLVcG1iYlcoPa_secret_NWxWv51tzRX1UqkiDbLOGumUO',
//       confirmation_method: 'automatic',
//       created: 1639002374,
//       currency: 'usd',
//       customer: null,
//       description: null,
//       invoice: null,
//       last_payment_error: null,
//       livemode: false,
//       metadata: {},
//       next_action: null,
//       on_behalf_of: null,
//       payment_method: null,
//       payment_method_options: {
//         card: {
//           installments: null,
//           network: null,
//           request_three_d_secure: 'automatic'
//         }
//       },
//       payment_method_types: [ 'card' ],
//       receipt_email: 'jenny.rosen@example.com',
//       review: null,
//       setup_future_usage: null,
//       shipping: null,
//       source: null,
//       statement_descriptor: null,
//       statement_descriptor_suffix: null,
//       status: 'requires_payment_method',
//       transfer_data: null,
//       transfer_group: null
//     }
//   */

//   // cart.map(async(cartItem) => {
//   //   const domainDetails = await calculate(cartItem.name, cartItem.duration);

//   //   if (!domainDetails.available)
//   //     return;
//   // });

//   // try {} catch(error) {}

//   // TODO
//   // : check to see if domain in cart is available
//   // : make sure duration is divisible by 2 and at least 2 or at max 10
//   // : calculate price with duration

//   // available / domain / premium / price

//   // Create a PaymentIntent with the order amount and currency
//   // const paymentIntent = await stripe.paymentIntents.create({
//   //   amount: calculateOrderAmount(items),
//   //   currency: "usd"
//   // });

//   // res.send({
//   //   clientSecret: paymentIntent.client_secret
//   // });

//   // return {
//   //   detail: {
//   //     // results
//   //     secret: "" // clientSecret
//   //   },
//   //   httpCode: 200,
//   //   message: "...",
//   //   success: true
//   // };
// }
