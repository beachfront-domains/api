


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";

/// util

import {
  accessControl,
  databaseParams,
  objectIsEmpty,
  personFromSession,
  stringTrim
} from "src/utility/index.ts";

import { PaymentKind } from "../schema.ts";
import * as maskPaymentMethod from "../utility/mask.ts";
import e from "dbschema";

import type { PaymentMethodUpdate } from "../schema.ts";
import type { DetailObject, LooseObject, StandardResponse } from "src/utility/index.ts";

const thisFilePath = "/src/component/payment/crud/update.ts";



/// export

export default (async(_root, args: PaymentMethodUpdate, ctx, _info?) => {
  if (!await accessControl(ctx))
    return null;

  const { params, updates } = args;

  if (objectIsEmpty(params) || objectIsEmpty(updates)) {
    log.warning(`[${thisFilePath}]› Missing required parameter(s).`);
    return { detail: null };
  }

  const client = createClient(databaseParams);
  const query: LooseObject = {};
  let response: DetailObject | null = null;

  Object.entries(updates).forEach(([key, value]) => {
    switch(key) {
      case "mask": {
        query[key] = stringTrim(value);
        break;
      }

      default:
        break;
    }
  });

  /// vibe check
  if (!query.mask) {
    log.warning(`[${thisFilePath}]› Vibe check failed.`);
    return { detail: response };
  }

  const doesDocumentExist = e.select(e.Payment, payment => ({
    ...e.Payment["*"],
    customer: payment.customer["*"],
    // TODO
    // : https://github.com/edgedb/edgedb-js/issues/347 : https://discord.com/channels/841451783728529451/1103366864937160846
    filter_single: params.id ?
      e.op(payment.id, "=", e.uuid(stringTrim(params.id))) :
      e.op(payment.vendorId, "=", stringTrim(params.vendorId))
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (!existenceResult) {
    log.warning(`[${thisFilePath}]› Cannot update nonexistent document.`);
    return { detail: response };
  }

  const owner = await personFromSession(ctx);

  if (!owner) {
    log.warning(`[${thisFilePath}]› THIS ERROR SHOULD NEVER BE REACHED.`);
    return { detail: response, error: [{ code: "TBA", message: error }] };
  }

  if (existenceResult.customer.id !== owner.id) {
    log.warning(`[${thisFilePath}]› Session customer ID doesn't match record's.`);
    return { detail: response };
  }

  query.mask = maskPaymentMethod(query.mask);

  // TODO
  // : update/create payment method within third-party service and return ID
  //   : query.vendorId

  try {
    const updateQuery = e.update(e.Payment, payment => ({
      filter_single: e.op(payment.id, "=", e.uuid(existenceResult.id)),
      set: {
        ...query,
        updated: e.datetime_of_transaction()
      }
    }));

    response = await e.select(updateQuery, payment => ({
      ...e.Payment["*"],
      customer: payment.customer["*"],
    })).run(client);

    return { detail: response };
  } catch(_) {
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while updating document.`);
    return { detail: response };
  }
}) satisfies StandardResponse;
