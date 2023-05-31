


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";

/// util

import { accessControl, databaseParams, stringTrim } from "src/utility/index.ts";
import e from "dbschema";

import type { LooseObject, StandardBooleanResponse } from "src/utility/index.ts";
import type { SessionRequest } from "../schema.ts";

const thisFilePath = "/src/component/session/crud/delete.ts";



/// export

export default async(_root, args: SessionRequest, ctx, _info?): StandardBooleanResponse => {
  if (!await accessControl(ctx))
    return { success: false };

  const client = createClient(databaseParams);
  const { params } = args;
  const query = ({} as LooseObject);

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "id": {
        query[key] = stringTrim(value);
        break;
      }

      default:
        break;
    }
  });

  const doesDocumentExist = e.select(e.Session, session => ({
    filter_single: e.op(session.id, "=", e.uuid(query.id))
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (!existenceResult) {
    log.warning(`[${thisFilePath}]› Cannot delete nonexistent document.`);
    return { success: true };
  }

  /// document exists, so grab ID to locate for deletion
  const documentId = e.uuid(existenceResult.id);

  try {
    const deleteQuery = e.delete(e.Session, session => ({
      filter_single: e.op(session.id, "=", documentId)
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
