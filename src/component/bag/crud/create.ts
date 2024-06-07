


/// import

import { log } from "dep/std.ts";

/// util

import { Bag } from "../schema.ts";
import { client, personFromSession, stringTrim } from "src/utility/index.ts";
import e from "dbschema";
import { PaymentKind } from "src/component/payment/schema.ts";
import { processBagItems } from "../utility/process.ts";

import type { BagCreate } from "../schema.ts";
import type { DetailObject, StandardResponse } from "src/utility/index.ts";

// const thisFilePath = "/src/component/bag/crud/create.ts";
// const thisFilePath = import.meta.filename;
const thisFilePath = import.meta.filename.split("src")[1];



/// export

export default async(_root, args: BagCreate, ctx, _info?): StandardResponse => {
  /// NOTE
  /// : this function doesn't need to be auth-gated

  const { params } = args;
  const query = ({} as Bag);
  let response: DetailObject | null = null;

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "bag": {
        query[key] = processBagItems(value);
        break;
      }

      case "currency": {
        query[key] = PaymentKind[stringTrim(String(value).toUpperCase())] === stringTrim(String(value).toUpperCase()) ?
          PaymentKind[stringTrim(String(value).toUpperCase())] :
          PaymentKind.FIAT;
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

  if (!query.customer && !query.bag) {
    const error = "Missing required parameter(s).";
    log.warn(`[${thisFilePath}]› ${error}`);
    return { detail: response }; // error: [{ code: "TBA", message: error }]
  }

  if (!query.customer) {
    const owner = await personFromSession(ctx);

    if (owner)
      query.customer = owner.id;
    else
      delete query.customer;
  }

  /// NOTE
  /// We do not check the `customer` ID for validity, as this is
  /// supposed to be a quick and easy way to have a persistent
  /// bag. We do not care at this point in time.
  ///
  /// When checkout occurs, we will validate `customer` ID.
  ///
  /// We also do not check for existing session document, they'll
  /// get auto-deleted after some time.

  // TODO
  // : could `customer` details get exposed to malicious parties?
  // : what if `query.customer` doesn't exist?

  try {
    const newDocument = e.insert(e.Bag, {
      ...query,
      ...(query.customer ? { /// `query.customer` might not exist
        customer: e.select(e.Customer, customerDocument => ({
          filter_single: e.op(customerDocument.id, "=", e.uuid(String(query.customer)))
        })),
      } : {}),
    });

    const databaseQuery = e.select(newDocument, document => ({
      ...e.Bag["*"],
      customer: document.customer["*"]
    }));

    response = await databaseQuery.run(client);

    return { detail: response };
  } catch(_) {
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while creating document.`);
    log.error(_);
    return { detail: response };
  }
}
