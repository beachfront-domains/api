


///  I M P O R T

import Stripe from "stripe";

///  U T I L

// import { SearchRequest } from "~service/search";
// const stripe = new Stripe("sk_test_...");



///  E X P O R T

// const calculateOrderAmount = items => {
//   // Replace this constant with a calculation of the order's amount
//   // Calculate the order total on the server to prevent
//   // people from directly manipulating the amount on the client
//   return 1400;
// };

export default async(suppliedData) => {
  const { cart, payment } = suppliedData;

  console.log(cart);
  console.log(payment);
  console.log("");

  // cart.map(async(cartItem) => {
  //   const domainDetails = await calculate(cartItem.name, cartItem.duration);

  //   if (!domainDetails.available)
  //     return;
  // });

  // try {} catch(error) {}

  // TODO
  // : check to see if domain in cart is available
  // : make sure duration is divisible by 2 and at least 2 or at max 10
  // : calculate price with duration

  // available / domain / premium / price

  // Create a PaymentIntent with the order amount and currency
  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount: calculateOrderAmount(items),
  //   currency: "usd"
  // });

  // res.send({
  //   clientSecret: paymentIntent.client_secret
  // });

  return {
    detail: {
      // results
      secret: "" // clientSecret
    },
    httpCode: 200,
    message: "...",
    success: true
  };
};
