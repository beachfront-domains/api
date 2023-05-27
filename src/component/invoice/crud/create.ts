


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";

/// util

import { accessControl, databaseParams, stringTrim } from "src/utility/index.ts";
import { InvoiceType, InvoiceVendor } from "../schema.ts";
import e from "dbschema";

import type { InvoiceCreate } from "../schema.ts";
import type { DetailObject, LooseObject, StandardResponse } from "src/utility/index.ts";

const thisFilePath = "/src/component/invoice/crud/create.ts";



/// export

export default (async(_root, args: InvoiceCreate, ctx, _info?) => {
  if (!await accessControl(ctx))
    return null;

  const client = createClient(databaseParams);
  const { params } = args;
  const query: LooseObject = {};
  let response: DetailObject | null = null;

  /// NOTE
  /// : `contents` expects format of `ACTION|DOMAIN` in an array
  ///   ex: ["register|eat.lunch", "renew|buy.dinner"]
  /// : `invoiceId` is auto-incremented by database
  /// : `paid` is `0` (false) by default. once vendor clears
  ///   payment, flip to `1` (true)
  /// : `payment` default is "CREDITCARD" so we don't need to
  ///   enforce this parameter's existence

  // TODO
  // : check `promo` validity (new table?)

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "customer":
      case "promo": {
        query[key] = stringTrim(value);
        break;
      }

      case "amount": {
        query[key] = Number(value).toFixed(2) || null;
        break;
      }

      case "contents": {
        // TODO
        // : validate/clean
        query[key] = value;
        break;
      }

      case "payment": {
        query[key] = InvoiceType[stringTrim(value).toUpperCase()] === stringTrim(value).toUpperCase() ?
          stringTrim(value).toUpperCase() :
          null;
        break;
      }

      case "vendor": {
        query[key] = InvoiceVendor[stringTrim(value).toUpperCase()] === stringTrim(value).toUpperCase() ?
          stringTrim(value).toUpperCase() :
          null;
        break;
      }

      default:
        break;
    }
  });

  /// vibe check
  if (!query.amount || !query.contents || !query.customer) {
    const error = "Missing required parameter(s).";
    log.warning(`[${thisFilePath}]› ${error}`);
    return { detail: response, error: [{ code: "TBA", message: error }] };
  }

  if (params.vendor && !query.vendor) {
    const error = "Invalid vendor";
    log.warning(`[${thisFilePath}]› ${error}`);
    return { detail: response, error: [{ code: "TBA", message: error }] };
  }

  /// NOTE
  /// : typically we'd look for existing documents but invoices are
  ///   different, also, duplicate invoices can be deleted

  try {
    const newDocument = e.insert(e.Invoice, { ...query });

    const databaseQuery = e.select(newDocument, invoice => ({
      ...e.Invoice["*"],
      customer: invoice.customer["*"]
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
