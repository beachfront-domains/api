


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

import { PaymentKind } from "../schema.ts";
import * as maskPaymentMethod from "../utility/mask.ts";
import e from "dbschema";

import type { PaymentMethodCreate } from "../schema.ts";
import type { DetailObject, LooseObject, StandardResponse } from "src/utility/index.ts";

const thisFilePath = "/src/component/payment/crud/create.ts";



/// export

export default (async(_root, args: InvoiceCreate, ctx, _info?) => {
  if (!await accessControl(ctx))
    return null;

  const client = createClient(databaseParams);
  const { params } = args;
  const query: LooseObject = {};
  let response: DetailObject | null = null;

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "kind": {
        query[key] = PaymentKind[stringTrim(value).toUpperCase()] === stringTrim(value).toUpperCase() ?
          stringTrim(value).toUpperCase() :
          null;
        break;
      }

      case "mask": {
        query[key] = stringTrim(value);
        break;
      }

      default:
        break;
    }
  });

  if (!query.kind || !query.mask) {
    const error = "Missing required parameter(s).";
    log.warning(`[${thisFilePath}]› ${error}`);
    return { detail: response, error: [{ code: "TBA", message: error }] };
  }

  if (query.mask.length < 12) { /// credit card numbers have at least 12 digits
    const error = "Invalid length for mask.";
    log.warning(`[${thisFilePath}]› ${error}`);
    return { detail: response, error: [{ code: "TBA", message: error }] };
  }

  const owner = await personFromSession(ctx);

  if (!owner) {
    log.warning(`[${thisFilePath}]› THIS ERROR SHOULD NEVER BE REACHED.`);
    return { detail: response, error: [{ code: "TBA", message: error }] };
  }

  query.customer = owner.id;
  query.mask = maskPaymentMethod(query.mask);

  // TODO
  // : should we check for existing document?
  //   : use customer id and mask?
  // : create payment method within third-party service and return ID
  //   : query.vendorId

  try {
    const newDocument = e.insert(e.Payment, { ...query });

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
}) satisfies StandardResponse;
