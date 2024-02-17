


/// import

import { log } from "dep/std.ts";
import { Stripe } from "dep/x/stripe.ts";

/// util

import {
  accessControl,
  client,
  stringTrim,
  validateEmail
} from "src/utility/index.ts";

import e from "dbschema";
import { Customer, CustomerLoginMethods, CustomerRoles } from "../schema.ts";
import { STRIPE_SECRET } from "src/utility/stripe/constant.ts";

import type { CustomerCreate } from "../schema.ts";
import type { DetailObject, StandardResponse } from "src/utility/index.ts";

const thisFilePath = import.meta.filename;



/// export

export default async(_root, args: CustomerCreate, ctx, _info?): StandardResponse => {
  if (!await accessControl(ctx))
    return { detail: null };

  const { params } = args;
  const query = ({} as Customer);
  let response: DetailObject | null = null;

  // TODO
  // : detect timezone in the app, send to api
  //   - validate customer timezone (timezones[suppliedTimezone])
  //   - default to cali timezone if validation fails
  // : `role` should only be an args.param if an admin is presnet in ctx

  /// NOTE
  /// : loginMethod, name, role, staff, and verified
  ///   have default values enforced by database
  /// : username is created later in this function

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "name":
      case "timezone":
      case "username": {
        query[key] = stringTrim(String(value));
        break;
      }

      case "email": {
        query[key] = validateEmail(stringTrim(String(value))) ?
          stringTrim(String(value).toLowerCase()) :
          "";
        break;
      }

      case "loginMethod": {
        query[key] = CustomerLoginMethods[stringTrim(String(value).toUpperCase())] === stringTrim(String(value).toUpperCase()) ?
          CustomerLoginMethods[stringTrim(String(value).toUpperCase())] :
          CustomerLoginMethods.LINK;
        break;
      }

      case "role": {
        query[key] = CustomerRoles[stringTrim(String(value).toUpperCase())] === stringTrim(String(value).toUpperCase()) ?
          CustomerRoles[stringTrim(String(value).toUpperCase())] :
          CustomerRoles.CUSTOMER;
        break;
      }

      case "staff":
      case "verified": {
        query[key] = Number(value);
        break;
      }

      default: {
        break;
      }
    }
  });

  /// vibe check
  if (query.email.length === 0) {
    const error = "Missing required parameter(s).";
    log.warning(`[${thisFilePath}]› ${error}`);
    return { detail: response }; // error: [{ code: "TBA", message: error }]
  }

  const doesDocumentExist = e.select(e.Customer, customer => ({
    ...e.Customer["*"],
    filter_single: e.op(customer.email, "=", query.email)
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (existenceResult) {
    log.warning(`[${thisFilePath}]› Existing document returned.`);
    return { detail: existenceResult }; /// document exists, return it
  }

  if (!query.username)
    query.username = createUsername(query.email);

  try {
    const newDocument = e.insert(e.Customer, { ...query });
    const databaseQuery = e.select(newDocument, () => ({ ...e.Customer["*"] }));

    /// we create the customer in our database, create the customer in Stripe's database,
    /// get the ID of customer within Stripe's database, update customer in our database
    /// with said ID

    const newCustomer = await databaseQuery.run(client);
    const stripeId = await createStripeCustomer(newCustomer);

    const updateQuery = e.update(e.Customer, customer => ({
      filter_single: e.op(customer.id, "=", e.uuid(newCustomer.id)),
      set: {
        stripe: stripeId,
        updated: e.datetime_of_transaction()
      }
    }));

    response = await e.select(updateQuery, () => ({ ...e.Customer["*"] })).run(client);
    return { detail: response };
  } catch(_) {
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while creating document.`);
    return { detail: response };
  }
}



/// helper

async function createStripeCustomer(info: any): Promise<string> {
  const stripe = new Stripe(STRIPE_SECRET);
  const { email, id, name } = info;

  const customer = await stripe.customers.create({
    description: id,
    email,
    metadata: {
      beachfront: id
    },
    name
  });

  return customer.id || "";
}

function createUsername(suppliedEmail: string): string {
  // TODO
  // : use something like nanoid instead of `Math.random`

  return String(suppliedEmail)
    .split("@")[0]
    .replace(/\+/g, "") + String(Math.random())
    .split(".")[1]
    .slice(0, 5);
}
