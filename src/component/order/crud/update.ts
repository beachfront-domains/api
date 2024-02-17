


/// import

import { log } from "dep/std.ts";

/// util

import {
  accessControl,
  client,
  objectIsEmpty,
  stringTrim,
  validateUUID
} from "src/utility/index.ts";

import e from "dbschema";
import { default as isValidBinaryValue } from "../utility/binary.ts";

import type { DetailObject, StandardResponse } from "src/utility/index.ts";
import type { Order, OrderUpdate } from "../schema.ts";

// const thisFilePath = "/src/component/order/crud/update.ts";
const thisFilePath = import.meta.filename;



/// export

export default async(_root, args: OrderUpdate, ctx, _info?): StandardResponse => {
  if (!await accessControl(ctx))
    return { detail: null };

  const { params, updates } = args;

  if (objectIsEmpty(params) || objectIsEmpty(updates) || !validateUUID(stringTrim(params.id))) {
    log.warning(`[${thisFilePath}]› Missing required parameter(s).`);
    return { detail: null };
  }

  const query = ({} as Order);
  let response: DetailObject | null = null;

  Object.entries(updates).forEach(([key, value]) => {
    switch(key) {
      case "currency": {
        query[key] = stringTrim(String(value).toUpperCase());
        break;
      }

      case "paid": {
        query[key] = Number(value) && isValidBinaryValue(Number(value)) ?
          Number(value) :
          0;
        break;
      }

      case "promo": {
        // TODO
        // : check if promo exists
        query[key] = stringTrim(String(value));
        break;
      }

      default:
        break;
    }
  });

  /// vibe check
  if (updates.paid && !query.paid) {
    const error = "Invalid parameter(s).";
    log.warning(`[${thisFilePath}]› ${error}`);
    return { detail: response, error: { code: "TBA", message: error }};
  }

  /// existence check
  const doesDocumentExist = e.select(e.Order, document => ({
    ...e.Customer["*"],
    filter_single: e.op(document.id, "=", e.uuid(stringTrim(params.id)))
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (!existenceResult) {
    log.warning(`[${thisFilePath}]› Cannot update nonexistent document.`);
    return { detail: response };
  }

  try {
    const updateQuery = e.update(e.Order, document => ({
      filter_single: e.op(document.id, "=", e.uuid(existenceResult.id)),
      // @ts-ignore | TS2322 [ERROR]: Type '{ updated: datetime_of_transactionλFuncExpr; bag: BagItem[]; currency: string; customer: string; number: number; paid: number; promo: string; total: string; vendor: { ...; }; created: Date; id: string; }' is not assignable to type '{ number?: number | TypeSet<$number, Cardinality.AtMostOne | Cardinality.One | Cardinality.Empty> | null | undefined; currency?: string | TypeSet<...> | null | undefined; ... 6 more ...; vendor?: { ...; } | ... 2 more ... | undefined; }'. | Types of property 'customer' are incompatible.
      set: {
        ...query,
        // TODO
        // : check this shit
        // customer: e.select(e.Customer, customerDocument => ({
        //   filter_single: e.op(customerDocument.id, "=", e.uuid(existenceResult.id))
        // })),
        updated: e.datetime_of_transaction()
      }
    }));

    // @ts-ignore | TS2739 [ERROR]: Type '{ number: number | null; currency: string | null; paid: number | null; promo: string | null; id: string; created: Date; updated: Date; bag: { duration: number; name: string; price: string; }[] | null; total: string | null; vendor: { ...; } | null; }[]' is missing the following properties from type 'DetailObject': created, id, updated
    response = await e.select(updateQuery, () => ({
      ...e.Order["*"]
    })).run(client);

    return { detail: response };
  } catch(_) {
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while updating document.`);
    return { detail: response };
  }
}
