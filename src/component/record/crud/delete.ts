


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";

/// util

import e from "dbschema";
import { accessControl, databaseParams } from "src/utility/index.ts";

import type { LooseObject, StandardBooleanResponse } from "src/utility/index.ts";
import type { RecordRequest } from "../schema.ts";

// const thisFilePath = "/src/component/record/crud/delete.ts";
const thisFilePath = import.meta.filename;



/// export

export default async(_root, args: RecordRequest, ctx, _info?): StandardBooleanResponse => {
  // TODO
  // : ensure `ctx` is in fact just a string (apiKey)
  if (!await accessControl(ctx))
    return { success: false };

  const client = createClient(databaseParams);
  const { params } = args;
  const query = ({} as LooseObject);

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "id": {
        query[key] = String(value);
        break;
      }

      default: {
        break;
      }
    }
  });

  const doesDocumentExist = e.select(e.dns.BaseRecord, record => ({
    filter_single: e.op(record.id, "=", e.uuid(query.id))
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (!existenceResult) {
    log.warn(`[${thisFilePath}]› Cannot delete nonexistent document.`);
    return { success: true };
  }

  /// document exists, so grab ID to locate for deletion
  const documentId = e.uuid(existenceResult.id);

  try {
    const deleteQuery = e.delete(e.dns.BaseRecord, record => ({
      filter_single: e.op(record.id, "=", documentId)
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
