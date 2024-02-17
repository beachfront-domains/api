


/// import

import { log } from "dep/std.ts";

/// util

import { Bag } from "../schema.ts";
import { client, objectIsEmpty, stringTrim } from "src/utility/index.ts";
import e from "dbschema";
import { PaymentKind } from "src/component/payment/schema.ts";
import { processBagItems } from "../utility/process.ts";

import type { BagUpdate } from "../schema.ts";
import type { DetailObject, StandardResponse } from "src/utility/index.ts";

// const thisFilePath = "/src/component/bag/crud/update.ts";
const thisFilePath = import.meta.filename.split("src")[1];



/// export

export default async(_root, args: BagUpdate, _ctx, _info?): StandardResponse => {
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

  const query = ({} as Bag);
  let response: DetailObject | null = null;

  Object.entries(updates).forEach(([key, value]) => {
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

  log.info(">>> params");
  log.info(params);

  log.info(">>> updates");
  log.info(updates);

  /// NOTE
  /// We do not check the `customer` ID for validity, as this is
  /// supposed to be a quick and easy way to have a persistent
  /// bag. We do not care at this point in time.
  ///
  /// When checkout occurs, we will validate `customer` ID.

  const doesDocumentExist = e.select(e.Bag, document => ({
    ...e.Bag["*"],
    customer: document.customer["*"],
    filter_single: e.op(document.id, "=", e.uuid(stringTrim(params.id)))
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (!existenceResult) {
    log.warning(`[${thisFilePath}]› Cannot update nonexistent document.`);
    return { detail: response };
  }

  // TODO
  // : replace entire bag with new update?

  // if (query.customer) {
  //   const doesCustomerExist = e.select(e.Customer, document => ({
  //     filter_single: e.op(document.id, "=", e.uuid(query.customer))
  //   }));

  //   const customerExistenceResult = await doesCustomerExist.run(client);

  //   if (!customerExistenceResult) {
  //     delete query.customer;
  //     log.warn(`[${thisFilePath}]› Customer does not exist in bag update.`);
  //   }
  // }

  try {
    const updateQuery = e.update(e.Bag, document => ({
      filter_single: e.op(document.id, "=", e.uuid(existenceResult.id)),
      set: {
        ...query,
        ...(query.customer ? { /// `query.customer` might not exist
          customer: e.select(e.Customer, customerDocument => ({
            filter_single: e.op(customerDocument.id, "=", e.uuid(String(query.customer)))
          })),
        } : {}),
        updated: e.datetime_of_transaction()
      }
    }));


    response = await e.select(updateQuery, document => ({
      ...e.Bag["*"],
      customer: document.customer["*"],
    })).run(client);

    return { detail: response };
  } catch(_) {
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while updating document.`);
    log.error(_);
    return { detail: response };
  }
}
