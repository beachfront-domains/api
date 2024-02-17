


/// import

import Stripe from "dep/x/stripe.ts";
import { wretch } from "dep/x/wretch.ts";

/// util

import { OPENNODE_KEY, OPENNODE_URL } from "./constant.ts";
import type { LooseObject } from "../../interface.ts";

// interface OpenNodeFailure {
//   message: string;
//   success: boolean;
// }

// interface OpenNodeResponse {
//   data: {
//     address: string;
//     amount: number;
//     auto_settle: boolean;
//     callback_url: string | null;
//     chain_invoice: {
//       address: string;
//     };
//     created_at: Date;
//     currency: string | null;
//     desc_hash: boolean;
//     description: string;
//     fiat_value: integer;
//     hosted_checkout_url: string;
//     id: string;
//     lightning_invoice: {
//       expires_at: Date;
//       payreq: string;
//     };
//     metadata: LooseObject;
//     notif_email: string;
//     order_id: int | null;
//     source_fiat_value: integer;
//     status: string;
//     success_url: string | null;
//     ttl: number;
//     uri: string;
//   }
// }



/// export

// const stripe = new Stripe('sk_test_...');

const createCustomer = async () => {
  const params: Stripe.CustomerCreateParams = {
    description: 'test customer',
  };

  const customer: Stripe.Customer = await stripe.customers.create(params);

  console.log(customer.id);
};

createCustomer();

export default async(stuff: any): Promise<OpenNodeFailure | OpenNodeResponse> => {
  // TODO
  // : pass customer object with `stripe`...if field is empty, create customer within Stripe and update customer `stripe` parameter
  // : if customer `stripe` isn't valid, block payment

  // STRIPE
  // : email | name
  // : metadata.beachfront should be set to customer's beachfront/ ID

  try {
    const data = await wretch(
      `${OPENNODE_URL}/v1/charges`, { // test for v2
        headers: {
          Authorization: OPENNODE_KEY
        }
      })
      .post({
        amount: 500,
        currency: "USD",
        customer_email: "paul@webb.page",
        description: "eat.dinner, pc.coroutine, sing.acappella"
      })
      .json<{ data: LooseObject; }>();

    if (!data)
      return null;

    console.log(data);
  } catch(_) {
    /// IGNORE
    console.group("/src/utility/opennode/create-charge.ts");
    console.error(_);
    console.groupEnd();
  }
}
