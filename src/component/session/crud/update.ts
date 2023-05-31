


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";

/// util

import { databaseParams, objectIsEmpty, stringTrim } from "src/utility/index.ts";
import { CartItem } from "../schema.ts";
import e from "dbschema";

import type { DetailObject, LooseObject, StandardResponse } from "src/utility/index.ts";
import type { SessionUpdate } from "../schema.ts";

const thisFilePath = "/src/component/session/crud/update.ts";



/// export

export default async(_root, args: SessionUpdate, _ctx, _info?): StandardResponse => {
  /// NOTE
  /// : this function doesn't need to be auth-gated

  // TODO
  // : if session exists in `ctx`, update that instead?
  // : remember to remove underscore from `ctx` if used

  const { params, updates } = args;

  if (objectIsEmpty(params) || objectIsEmpty(updates)) {
    log.warning(`[${thisFilePath}]› Missing required parameter(s).`);
    return { detail: null };
  }

  const client = createClient(databaseParams);
  const query = ({} as LooseObject);
  let response: DetailObject | null = null;

  function processCartItems(arr): CartItem[] {
    return arr.map((item: CartItem) => item);
  }

  Object.entries(updates).forEach(([key, value]) => {
    switch(key) {
      case "cart": {
        // query[key] = [...new Set(value as CartItem[])] || null; /// eliminate duplicates
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

  /// NOTE
  /// We do not check the `customer` ID for validity, as this is
  /// supposed to be a quick and easy way to have a persistent
  /// cart. We do not care at this point in time.
  ///
  /// When checkout occurs, we will validate `customer` ID.

  const doesDocumentExist = e.select(e.Session, session => ({
    ...e.Session["*"],
    customer: session.customer["*"],
    filter_single: e.op(session.id, "=", e.uuid(stringTrim(params.id)))
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (!existenceResult) {
    log.warning(`[${thisFilePath}]› Cannot update nonexistent document.`);
    return { detail: response };
  }

  try {
    const updateQuery = e.update(e.Session, session => ({
      filter_single: e.op(session.id, "=", e.uuid(existenceResult.id)),
      set: {
        ...query,
        updated: e.datetime_of_transaction()
      }
    }));

    response = await e.select(updateQuery, session => ({
      ...e.Session["*"],
      customer: session.customer["*"],
    })).run(client);

    return { detail: response };
  } catch(_) {
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while updating document.`);
    return { detail: response };
  }
}
