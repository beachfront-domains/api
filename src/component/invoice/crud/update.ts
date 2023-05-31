


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";

/// util

import {
  accessControl,
  databaseParams,
  objectIsEmpty,
  stringTrim
} from "src/utility/index.ts";

import { InvoiceType, InvoiceVendor } from "../schema.ts";
import e from "dbschema";

import type { InvoiceUpdate } from "../schema.ts";
import type { DetailObject, LooseObject, StandardResponse } from "src/utility/index.ts";

const thisFilePath = "/src/component/invoice/crud/create.ts";



/// export

export default async(_root, args: InvoiceUpdate, ctx, _info?): StandardResponse => {
  if (!await accessControl(ctx))
    return { detail: null };

  const { params, updates } = args;

  if (objectIsEmpty(params) || objectIsEmpty(updates)) {
    log.warning(`[${thisFilePath}]› Missing required parameter(s).`);
    return { detail: null };
  }

  const client = createClient(databaseParams);
  const query = ({} as LooseObject);
  let response: DetailObject | null = null;

  Object.entries(updates).forEach(([key, value]) => {
    switch(key) {
      case "paid": {
        query[key] = Number(value);
        break;
      }

      case "payment": {
        query[key] = InvoiceType[stringTrim(String(value).toUpperCase())] === stringTrim(String(value).toUpperCase()) ?
          InvoiceType[stringTrim(String(value).toUpperCase())] :
          InvoiceType.CREDITCARD;
        break;
      }

      case "vendor": {
        query[key] = InvoiceVendor[stringTrim(String(value).toUpperCase())] === stringTrim(String(value).toUpperCase()) ?
          InvoiceVendor[stringTrim(String(value).toUpperCase())] :
          InvoiceVendor.STRIPE;
        break;
      }

      default:
        break;
    }
  });

  /// vibe check
  if (updates.payment && !query.payment || updates.vendor && !query.vendor) {
    log.warning(`[${thisFilePath}]› Vibe check failed.`);
    return { detail: response };
  }

  const doesDocumentExist = e.select(e.Invoice, invoice => ({
    filter_single: params.id ?
      e.op(invoice.id, "=", e.uuid(String(params.id))) :
      e.op(invoice.invoiceId, "=", Number(params.invoiceId))
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (!existenceResult) {
    log.warning(`[${thisFilePath}]› Cannot update nonexistent document.`);
    return { detail: response };
  }

  try {
    const updateQuery = e.update(e.Invoice, invoice => ({
      filter_single: e.op(invoice.id, "=", e.uuid(existenceResult.id)),
      set: {
        ...query,
        updated: e.datetime_of_transaction()
      }
    }));

    response = await e.select(updateQuery, () => ({
      ...e.Invoice["*"]
    })).run(client);

    return { detail: response };
  } catch(_) {
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while updating document.`);
    return { detail: response };
  }
}
