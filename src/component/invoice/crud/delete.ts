


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";
import { toASCII } from "dep/x/tr46.ts";

/// util

import { accessControl, databaseOptions, stringTrim } from "src/utility/index.ts";
import e from "dbschema";

import type { InvoiceRequest } from "../schema.ts";
import type { LooseObject, StandardBooleanResponse } from "src/utility/index.ts";

const thisFilePath = "/src/component/invoice/crud/delete.ts";



/// export

export default (async(_root, args: InvoiceRequest, ctx, _info?) => {
  if (!await accessControl(ctx))
    return null;

  const client = createClient(databaseOptions);
  const { params } = args;
  const query: LooseObject = {};

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "id": {
        query[key] = stringTrim(value);
        break;
      }

      case "invoiceId": {
        query[key] = Number(value);
        break;
      }

      default:
        break;
    }
  });

  const doesDocumentExist = e.select(e.Invoice, invoice => ({
    filter_single: query.id ?
      e.op(invoice.id, "=", e.uuid(invoice.id)) :
      e.op(invoice.invoiceId, "=", query.invoiceId)
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (!existenceResult) {
    log.warning(`[${thisFilePath}]› Cannot delete nonexistent document.`);
    return { success: true };
  }

  /// document exists, so grab ID to locate for deletion
  const documentId = e.uuid(existenceResult.id);

  try {
    const deleteQuery = e.delete(e.Invoice, invoice => ({
      filter_single: e.op(invoice.id, "=", documentId)
    }));

    await deleteQuery.run(client);

    return { success: true };
  } catch(_) {
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while deleting document.`);
    return { success: false };
  }
}) satisfies StandardBooleanResponse;
