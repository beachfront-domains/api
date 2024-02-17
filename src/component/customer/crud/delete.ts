


/// import

import { log } from "dep/std.ts";

/// util

import { accessControl, client, stringTrim } from "src/utility/index.ts";
import e from "dbschema";

import type { CustomerRequest } from "../schema.ts";
import type { LooseObject, StandardBooleanResponse } from "src/utility/index.ts";

const thisFilePath = import.meta.filename;



/// export

export default async(_root, args: CustomerRequest, ctx, _info?): StandardBooleanResponse => {
  if (!await accessControl(ctx))
    return { success: false };

  const { params } = args;
  const query = ({} as LooseObject);

  // TODO
  // : if customer owns domains, flag them for deletion
  // : cancel web hosting, data storage, &c
  // : log deletions?

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "email":
      case "id": {
        query[key] = stringTrim(value);
        break;
      }

      default:
        break;
    }
  });

  const doesDocumentExist = e.select(e.Customer, customer => ({
    filter_single: query.id ?
      e.op(customer.id, "=", e.uuid(query.id)) :
      e.op(customer.email, "=", query.email)
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (!existenceResult) {
    log.warning(`[${thisFilePath}]› Cannot delete nonexistent document.`);
    return { success: true };
  }

  /// document exists, so grab ID to locate for deletion
  const documentId = e.uuid(existenceResult.id);

  try {
    const deleteQuery = e.delete(e.Customer, customer => ({
      filter_single: e.op(customer.id, "=", documentId)
    }));

    await deleteQuery.run(client);

    return { success: true };
  } catch(_) {
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while deleting document.`);
    return { success: false };
  }
}
