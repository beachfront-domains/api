


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";

/// util

import { Bag } from "../schema.ts";
import { databaseParams, personFromSession, stringTrim } from "src/utility/index.ts";
import e from "dbschema";
import { PaymentKind } from "src/component/payment/schema.ts";
import { processBagItems } from "../utility/process.ts";

import type { BagCreate } from "../schema.ts";
import type { DetailObject, StandardResponse } from "src/utility/index.ts";

const thisFilePath = "/src/component/bag/crud/create.ts";



/// export

export default async(_root, args: BagCreate, ctx, _info?): StandardResponse => {
  /// NOTE
  /// : this function doesn't need to be auth-gated

  const client = createClient(databaseParams);
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
    log.warning(`[${thisFilePath}]› ${error}`);
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

  try {
    // @ts-ignore | 2345 | Type 'BagItem[]' is not assignable to type '{ duration: number; name: string; price: number; } | TypeSet<NamedTupleType<{ duration: $number; name: $str; price: $number; }>, Cardinality.AtMostOne | Cardinality.One | Cardinality.Empty> | null | undefined'.
    const newDocument = e.insert(e.Bag, {
      ...query,
      customer: query.customer && e.select(e.Customer, document => ({
        filter_single: e.op(document.id, "=", e.uuid(query.customer))
      }))
    });

    const databaseQuery = e.select(newDocument, document => ({
      ...e.Bag["*"],
      customer: document.customer["*"]
    }));

    response = await databaseQuery.run(client);

    return { detail: response };
  } catch(_) {
    console.log(">>> _");
    console.log(_);
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while creating document.`);
    return { detail: response };
  }
}
