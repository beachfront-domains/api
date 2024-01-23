


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";

/// util

import {
  accessControl,
  databaseParams,
  stringTrim,
  validateUUID
} from "src/utility/index.ts";

import e from "dbschema";
import { default as isValidBinaryValue } from "../utility/binary.ts";
import { processBagItems } from "../../bag/utility/process.ts";
import { default as processVendor } from "../utility/process.ts";

import type { DetailObject, StandardResponse } from "src/utility/index.ts";
import type { Order, OrderCreate } from "../schema.ts";

const thisFilePath = "/src/component/order/crud/create.ts";



/// export

export default async(_root, args: OrderCreate, ctx, _info?): StandardResponse => {
  if (!await accessControl(ctx))
    return { detail: null, error: { code: "TBA", message: "Protected route" }};

  const client = createClient(databaseParams);
  const { params } = args;
  const query = ({} as Order);
  let response: DetailObject | null = null;

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "bag": {
        query[key] = processBagItems(value);
        break;
      }

      case "currency": {
        query[key] = stringTrim(String(value).toUpperCase());
        break;
      }

      case "customer": {
        query[key] = validateUUID(stringTrim(String(value))) ? stringTrim(String(value)) : null;
        break;
      }

      case "paid": {
        query[key] = Number(value) && isValidBinaryValue(Number(value)) ?
          Number(value) :
          null;
        break;
      }

      case "promo": {
        // TODO
        // : check if promo exists
        query[key] = stringTrim(String(value));
        break;
      }

      case "total": {
        // TODO
        // : `total` as string? because decimal?
        // : might remove this...this should be calculated on the server
        query[key] = Number(value);
        break;
      }

      case "vendor": {
        query[key] = processVendor(value);
        break;
      }

      default:
        break;
    }
  });

  /// vibe check
  if (!query.bag || !query.customer || !query.vendor) {
    const error = "Missing required parameter(s).";
    log.warning(`[${thisFilePath}]› ${error}`);
    return { detail: response, error: { code: "TBA", message: error }};
  }

  if (query.bag.length < 1) {
    const error = "How did this happen? Checking out with an empty bag?!";
    log.warning(`[${thisFilePath}]› ${error}`);
    return { detail: response, error: { code: "TBA", message: error }};
  }

  /// existence checks
  const doesCustomerExist = e.select(e.Customer, document => ({
    ...e.Customer["*"],
    filter_single: e.op(document.id, "=", e.uuid(query.customer))
  }));

  const customerExistenceResult = await doesCustomerExist.run(client);

  if (!customerExistenceResult) {
    const error = "Customer does not exist.";
    log.warning(`[${thisFilePath}]› ${error}`);
    return { detail: response, error: { code: "TBA", message: error }};
  }

  /// TODO
  /// : doesPromoExist

  try {
    const newDocument = e.insert(e.Order, {
      ...query,
      // @ts-ignore | TS2322 [ERROR]: Type '"" | $expr_Select<{ __element__: ObjectType<"default::Customer", { id: PropertyDesc<$uuid, Cardinality.One, true, false, true, true>; __type__: LinkDesc<$ObjectType, ... 5 more ..., false>; ... 20 more ...; "<owner": LinkDesc<...>; }, Omit<...>, ExclusiveTuple>; __cardinality__: Cardinality.AtMostOne; }>' is not assignable to type 'TypeSet<ObjectType<string, { id: PropertyDesc<$uuid, Cardinality.One, true, false, true, true>; __type__: LinkDesc<$ObjectType, Cardinality.One, ... 4 more ..., false>; ... 20 more ...; "<owner": LinkDesc<...>; }, any, ExclusiveTuple>, Cardinality.AtMostOne | ... 1 more ... | Cardinality.Empty> | null | undefined'.
      customer: query.customer && e.select(e.Customer, document => ({
        filter_single: e.op(document.id, "=", e.uuid(query.customer))
      }))
    });

    const databaseQuery = e.select(newDocument, document => ({
      ...e.Order["*"],
      customer: document.customer["*"]
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
