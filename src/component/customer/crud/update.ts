


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";

/// util

import {
  accessControl,
  databaseParams,
  objectIsEmpty,
  stringTrim,
  validateEmail
} from "src/utility/index.ts";

import e from "dbschema";
import { CustomerLoginMethods, CustomerRoles } from "../schema.ts";

import type { CustomerUpdate } from "../schema.ts";

import type {
  DetailObject,
  LooseObject,
  StandardResponse
} from "src/utility/index.ts";

const thisFilePath = "/src/component/customer/crud/update.ts";



/// export

export default async(_root, args: CustomerUpdate, ctx, _info?): StandardResponse => {
  if (!await accessControl(ctx))
    return { detail: null };

  const { params, updates } = args;

  if (objectIsEmpty(params) || objectIsEmpty(updates)) {
    log.warning(`[${thisFilePath}]› Missing required parameter(s).`);
    return { detail: null };
  }

  const client = createClient(databaseParams);
  const query = ({} as LooseObject);
  let response: DetailObject | null = null;

  // TODO
  // : validate timezone

  Object.entries(updates).forEach(([key, value]) => {
    switch(key) {
      case "name":
      case "timezone":
      case "username": {
        query[key] = stringTrim(String(value));
        break;
      }

      case "email": {
        query[key] = validateEmail(String(value)) ?
          String(value).toLowerCase() :
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

      default:
        break;
    }
  });

  /// vibe check
  if (
    updates.email && !query.email ||
    updates.loginMethod && !query.loginMethod ||
    updates.role && !query.role
  ) {
    log.warning(`[${thisFilePath}]› Vibe check failed.`);
    return { detail: response };
  }

  if (updates.email && updates.email.length > 0) {
    const doesDocumentExist = e.select(e.Customer, customer => ({
      filter_single: e.op(customer.email, "=", query.email)
    }));

    const existenceResult = await doesDocumentExist.run(client);

    if (existenceResult) {
      log.warning(`[${thisFilePath}]› Cannot update, email in use.`);
      return { detail: response };
    }
  }

  if (updates.username) {
    const doesDocumentExist = e.select(e.Customer, customer => ({
      filter_single: e.op(customer.username, "=", query.username)
    }));

    const existenceResult = await doesDocumentExist.run(client);

    if (existenceResult) {
      log.warning(`[${thisFilePath}]› Cannot update, username in use.`);
      return { detail: response };
    }

    // TODO
    // : create `isAdmin` and/or `isStaff` function(s)

    /// Block non-admin customer from changing username to a restricted username
    /// If customer has an admin role, proceed.
    // if (originalCustomerData.role !== "admin" && invalidUsername.indexOf(changes.username) > 0) {
    //   databaseConnection.close();

    //   return {
    //     httpCode: 401,
    //     message: messageErrorUsernameNope,
    //     success: false
    //   };
    // }
  }

  const doesDocumentExist = e.select(e.Customer, customer => ({
    filter_single: params.id ?
      e.op(customer.id, "=", e.uuid(String(params.id))) :
      e.op(customer.email, "=", String(params.email))
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (!existenceResult) {
    log.warning(`[${thisFilePath}]› Cannot update nonexistent document.`);
    return { detail: response };
  }

  try {
    const updateQuery = e.update(e.Customer, customer => ({
      filter_single: e.op(customer.id, "=", e.uuid(existenceResult.id)),
      set: {
        ...query,
        updated: e.datetime_of_transaction()
      }
    }));

    response = await e.select(updateQuery, () => ({
      ...e.Customer["*"]
    })).run(client);

    return { detail: response };
  } catch(_) {
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while updating document.`);
    return { detail: response };
  }
}
