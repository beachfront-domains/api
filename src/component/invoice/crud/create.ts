


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

import { InvoiceType, InvoiceVendor } from "../schema.ts";
import e from "dbschema";

import type { Invoice, InvoiceCreate } from "../schema.ts";
import type { DetailObject, StandardResponse } from "src/utility/index.ts";

const thisFilePath = "/src/component/invoice/crud/create.ts";



/// export

export default async(_root, args: InvoiceCreate, ctx, _info?): StandardResponse => {
  if (!await accessControl(ctx))
    return { detail: null };

  const client = createClient(databaseParams);
  const { params } = args;
  const query = ({} as Invoice);
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

  function stringifyArrayContents(arr) {
    return arr.map(item => String(item));
  }

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "customer":
      case "promo": {
        query[key] = stringTrim(String(value));
        break;
      }

      case "amount": {
        query[key] = Number(value); // .toFixed(2) is apparently a string
        break;
      }

      case "contents": {
        // TODO
        // : validate/clean
        query[key] = stringifyArrayContents(value);
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
  if (!query.amount || !query.contents || !query.customer) {
    const error = "Missing required parameter(s).";
    log.warning(`[${thisFilePath}]› ${error}`);
    return { detail: response }; // error: [{ code: "TBA", message: error }]
  }

  if (params.vendor && !query.vendor) {
    const error = "Invalid vendor";
    log.warning(`[${thisFilePath}]› ${error}`);
    return { detail: response }; // error: [{ code: "TBA", message: error }]
  }

  /// NOTE
  /// : typically we'd look for existing documents but invoices are
  ///   different, also, duplicate invoices can be deleted

  try {
    const owner = await personFromSession(ctx);

    if (!owner) {
      log.warning(`[${thisFilePath}]› THIS ERROR SHOULD NEVER BE REACHED.`);
      return { detail: response }; // error: [{ code: "TBA", message: error }]
    }

    const newDocument = e.insert(e.Invoice, {
      ...query,
      customer: e.select(e.Customer, document => ({
        filter_single: e.op(document.id, "=", e.uuid(owner.id))
      }))
    });

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
}
