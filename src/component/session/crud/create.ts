


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";

/// util

import { databaseParams, personFromSession, stringTrim } from "src/utility/index.ts";
import { CartItem, Session } from "../schema.ts";
import e from "dbschema";

import type { DetailObject, StandardResponse } from "src/utility/index.ts";
import type { SessionCreate } from "../schema.ts";

const thisFilePath = "/src/component/session/crud/create.ts";



/// export

export default async(_root, args: SessionCreate, ctx, _info?): StandardResponse => {
  /// NOTE
  /// : this function doesn't need to be auth-gated

  const client = createClient(databaseParams);
  const { params } = args;
  const query = ({} as Session);
  let response: DetailObject | null = null;

  function processCartItems(arr): CartItem[] {
    return arr.map((item: CartItem) => item);
  }

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "cart": {
        // query[key] = [...new Set(value as CartItem[])]; /// eliminate duplicates
        // query[key] = [...new Set(processCartItems(value))];
        query[key] = processCartItems(value);
        break;
      }

      case "customer": {
        query[key] = stringTrim(String(value));
        break;
      }

      default:
        break;
    }
  });

  if (!query.customer && !query.cart) {
    const error = "Missing required parameter(s).";
    log.warning(`[${thisFilePath}]› ${error}`);
    return { detail: response }; // error: [{ code: "TBA", message: error }]
  }

  if (!query.customer) {
    const owner = await personFromSession(ctx);

    if (owner)
      query.customer = owner.id;
  }

  /// NOTE
  /// We do not check the `customer` ID for validity, as this is
  /// supposed to be a quick and easy way to have a persistent
  /// cart. We do not care at this point in time.
  ///
  /// When checkout occurs, we will validate `customer` ID.
  ///
  /// We also do not check for existing session document, they'll
  /// get auto-deleted after some time.

  // TODO
  // : could `customer` details get exposed to malicious parties?

  try {
    // @ts-ignore | Types of property "cart" are incompatible.
    const newDocument = e.insert(e.Session, {
      ...query,
      customer: e.select(e.Customer, document => ({
        filter_single: e.op(document.id, "=", e.uuid(query.customer))
      }))
    });

    const databaseQuery = e.select(newDocument, session => ({
      ...e.Session["*"],
      customer: session.customer["*"]
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
