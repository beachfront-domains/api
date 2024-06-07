


/// import

import { log } from "dep/std.ts";
import { toASCII } from "dep/x/tr46.ts";

/// util

import {
  createSessionToken,
  client,
  decode,
  verify
} from "src/utility/index.ts";

import e from "dbschema";

import type { DetailObject, StandardResponse } from "src/utility/index.ts";
import type { SessionCreate } from "../schema.ts";

// const thisFilePath = "/src/component/session/crud/create.ts";
const thisFilePath = import.meta.filename;



/// export

export default async(_root, args: SessionCreate, _ctx?, _info?): StandardResponse => {
  /// this function needs to be accessible to non-authenticated folks
  const { params } = args;
  const query: any = {};
  let response: DetailObject | null = null;

  /// after clicking login link, the jwt is passing through `token`
  /// if legit, discard token and proceed to create session

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "device":
      case "for":
      case "ip":
      case "token": {
        query[key] = String(value);
        break;
      }

      case "nickname": {
        query[key] = String(value).length > 0 ?
          toASCII(String(value)) :
          "Some Device";
        break;
      }

      default: {
        break;
      }
    }
  });

  /// vibe check
  if (!query.for || !query.token) {
    const err = "Missing required parameter(s).";

    log.warn(`[${thisFilePath}]› ${err}`);
    return { detail: response, error: { code: "TBA", message: err } };
  }

  /// validate token
  if (!verify(query.token)) {
    const err = "Token is invalid.";

    log.warn(`[${thisFilePath}]› ${err}`);
    return { detail: response, error: { code: "TBA", message: err } };
  }

  /// ensure focus of session exists
  const doesCustomerExist = e.select(e.Customer, customer => ({
    ...e.Customer["*"],
    filter_single: e.op(customer.id, "=", e.uuid(query.for))
  }));

  const customerExistenceResult = await doesCustomerExist.run(client);

  if (!customerExistenceResult) {
    log.warn(`[${thisFilePath}]› Customer doesn't exist.`);
    return { detail: response };
  }

  /// ensure token subject and session focus from previous step matches
  const { payload: { sub: jwtSubject }} = decode(query.token);

  if (customerExistenceResult.id !== jwtSubject.split("id|")[1]) {
    log.warn(`[${thisFilePath}]› Token subject doesn't match customer.`);
    return { detail: response };
  }

  try {
    const newDocument = e.insert(e.Session, {
      ...query,
      expires: new Date(
        new Date().getTime() + /// currentTime
        20160 * 60 * 1000      /// add 20,160 minutes (two weeks)
      ),
      /// linked properties require subqueries...kind of a waste of resources
      for: e.select(e.Customer, customer => ({
        filter: e.op(customer.id, "=", e.uuid(customerExistenceResult.id))
      })),
      token: createSessionToken(query.for)
    });

    const databaseQuery = e.select(newDocument, session => ({
      ...e.Session["*"],
      for: session.for["*"]
    }));

    response = await databaseQuery.run(client);
    return { detail: response };
  } catch(_) {
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while creating document.`);
    return { detail: response };
  }
}
