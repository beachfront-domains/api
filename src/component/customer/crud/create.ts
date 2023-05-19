


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";

/// util

import {
  accessControl,
  databaseOptions,
  stringTrim,
  validateEmail
} from "src/utility/index.ts";

import e from "dbschema";
import { CustomerLoginMethods, CustomerRoles } from "../schema.ts";

import type { CustomerCreate } from "../schema.ts";
import type { DetailObject, LooseObject, StandardResponse } from "src/utility/index.ts";

const thisFilePath = "/src/component/customer/crud/create.ts";



/// export

export default (async(_root, args: CustomerCreate, ctx, _info?) => {
  if (!await accessControl(ctx))
    return null;

  const client = createClient(databaseOptions);
  const { params } = args;
  const query: LooseObject = {};
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
        query[key] = stringTrim(value);
        break;
      }

      case "email": {
        query[key] = validateEmail(stringTrim(value)) ?
          String(stringTrim(value)).toLowerCase() :
          null;
        break;
      }

      case "loginMethod": {
        query[key] = CustomerLoginMethods[stringTrim(value).toUpperCase()] === stringTrim(value).toUpperCase() ?
          stringTrim(value).toUpperCase() :
          null;
        break;
      }

      case "role": {
        query[key] = CustomerRoles[stringTrim(value).toUpperCase()] === stringTrim(value).toUpperCase() ?
          stringTrim(value).toUpperCase() :
          null;
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
  if (!query.email) {
    const error = "Missing required parameter(s).";
    log.warning(`[${thisFilePath}]› ${error}`);
    return { detail: response, error: [{ code: "TBA", message: error }] };
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

    response = await databaseQuery.run(client);

    return { detail: response };
  } catch(_) {
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while creating document.`);
    return { detail: response };
  }
}) satisfies StandardResponse;



/// helper

function createUsername(suppliedEmail: string): string {
  // TODO
  // : use something like nanoid instead of `Math.random`

  return String(suppliedEmail)
    .split("@")[0]
    .replace(/\+/g, "") + String(Math.random())
    .split(".")[1]
    .slice(0, 5);
}
