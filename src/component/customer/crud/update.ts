


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";

/// util

import {
  accessControl,
  databaseParams,
  objectIsEmpty,
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

export default (async(_root, args: CustomerUpdate, ctx, _info?) => {
  if (!await accessControl(ctx))
    return null;

  const { params, updates } = args;

  if (objectIsEmpty(params) || objectIsEmpty(updates)) {
    log.warning(`[${thisFilePath}]› Missing required parameter(s).`);
    return { detail: null };
  }

  const client = createClient(databaseParams);
  const query: LooseObject = {};
  let response: DetailObject | null = null;

  // TODO
  // : validate timezone

  Object.entries(updates).forEach(([key, value]) => {
    switch(key) {
      case "name":
      case "timezone":
      case "username": {
        query[key] = String(value);
        break;
      }

      case "email": {
        query[key] = validateEmail(String(value)) ?
          String(value).toLowerCase() :
          null;
        break;
      }

      case "loginMethod": {
        query[key] = CustomerLoginMethods[String(value).toUpperCase()] === String(value).toUpperCase() ?
          String(value).toUpperCase() :
          null;
        break;
      }

      case "role": {
        query[key] = CustomerRoles[String(value).toUpperCase()] === String(value).toUpperCase() ?
          String(value).toUpperCase() :
          null;
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

  if (updates.email) {
    const doesDocumentExist = e.select(e.Customer, customer => ({
      filter_single: e.op(customer.email, "=", updates.email)
    }));

    const existenceResult = await doesDocumentExist.run(client);

    if (existenceResult) {
      log.warning(`[${thisFilePath}]› Cannot update, email in use.`);
      return { detail: response };
    }
  }

  if (updates.username) {
    const doesDocumentExist = e.select(e.Customer, customer => ({
      filter_single: e.op(customer.username, "=", updates.username)
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
}) satisfies StandardResponse;
