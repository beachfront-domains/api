


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";

/// util

import {
  accessControl,
  databaseParams,
  personFromSession,
  stringTrim
} from "src/utility/index.ts";

import { PaymentKind, PaymentMethod } from "../schema.ts";
import { default as maskPaymentMethod } from "../utility/mask.ts";
import e from "dbschema";

import type { PaymentMethodCreate } from "../schema.ts";
import type { DetailObject, StandardResponse } from "src/utility/index.ts";

const thisFilePath = "/src/component/payment/crud/create.ts";



/// export

export default async(_root, args: PaymentMethodCreate, ctx, _info?): StandardResponse => {
  if (!await accessControl(ctx))
    return { detail: null };

  const client = createClient(databaseParams);
  const { params } = args;
  const query = ({} as PaymentMethod);
  let response: DetailObject | null = null;

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "kind": {
        query[key] = PaymentKind[stringTrim(String(value).toUpperCase())] === stringTrim(String(value).toUpperCase()) ?
          PaymentKind[stringTrim(String(value).toUpperCase())] :
          PaymentKind.FIAT;
        break;
      }

      case "mask": {
        query[key] = maskPaymentMethod(value);
        break;
      }

      default:
        break;
    }
  });

  if (!query.kind || !query.mask) {
    const error = "Missing required parameter(s).";
    log.warning(`[${thisFilePath}]› ${error}`);
    return { detail: response }; // error: [{ code: "TBA", message: error }]
  }

  if (query.mask.length < 12) { /// credit card numbers have at least 12 digits
    const error = "Invalid length for mask.";
    log.warning(`[${thisFilePath}]› ${error}`);
    return { detail: response }; // error: [{ code: "TBA", message: error }]
  }

  // TODO
  // : should we check for existing document?
  //   : use customer id and mask?
  // : create payment method within third-party service and return ID
  //   : query.vendorId
  //   : round-robin process

  query.vendorId = "";

  try {
    const owner = await personFromSession(ctx);

    if (!owner) {
      log.warning(`[${thisFilePath}]› THIS ERROR SHOULD NEVER BE REACHED.`);
      return { detail: response }; // error: [{ code: "TBA", message: error }]
    }

    const newDocument = e.insert(e.Payment, {
      ...query,
      customer: e.select(e.Customer, document => ({
        filter_single: e.op(document.id, "=", e.uuid(owner.id))
      }))
    });

    const databaseQuery = e.select(newDocument, payment => ({
      ...e.Payment["*"],
      customer: payment.customer["*"]
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
