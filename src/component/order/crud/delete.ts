


/// import

import { log } from "dep/std.ts";

/// util

import {
  accessControl,
  client,
  stringTrim,
  validateUUID
} from "src/utility/index.ts";

import e from "dbschema";

import type { Order, OrderRequest } from "../schema.ts";
import type { StandardBooleanResponse } from "src/utility/index.ts";

// const thisFilePath = "/src/component/order/crud/delete.ts";
const thisFilePath = import.meta.filename;



/// export

export default async(_root, args: OrderRequest, ctx, _info?): StandardBooleanResponse => {
  if (!await accessControl(ctx))
    return { success: false };

  const { params } = args;
  const query = ({} as Order);

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "id": {
        query[key] = stringTrim(String(value));
        break;
      }

      default:
        break;
    }
  });

  /// vibe check
  if (!query.id || !validateUUID(query.id)) {
    const error = "Missing required parameter(s).";
    log.warn(`[${thisFilePath}]› ${error}`);
    return { success: false };
  }

  /// existence check
  const doesDocumentExist = e.select(e.Order, document => ({
    filter_single: e.op(document.id, "=", e.uuid(query.id))
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (!existenceResult) {
    log.warn(`[${thisFilePath}]› Cannot delete nonexistent document.`);
    return { success: true };
  }

  try {
    const deleteQuery = e.delete(e.Order, document => ({
      filter_single: e.op(document.id, "=", e.uuid(existenceResult.id))
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
