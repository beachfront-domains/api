


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";

/// util

import { accessControl, databaseOptions } from "src/utility/index.ts";
import e from "dbschema";

import type { CustomerRequest } from "../schema.ts";
import type { LooseObject, StandardBooleanResponse } from "src/utility/index.ts";

const thisFilePath = "/src/component/customer/crud/delete.ts";



/// export

export default (async(_root, args: DomainRequest, ctx, _info?) => {
  if (!await accessControl(ctx))
    return null;

  const client = createClient(databaseOptions);
  const { params } = args;
  const query: LooseObject = {};

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "id": {
        query[key] = String(value);
        break;
      }

      case "name": {
        query[key] = toASCII(String(value));
        break;
      }

      default:
        break;
    }
  });

  const doesDocumentExist = e.select(e.Domain, domain => ({
    filter_single: query.id ?
      e.op(domain.id, "=", e.uuid(domain.id)) :
      e.op(domain.name, "=", query.name)
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (!existenceResult) {
    log.warning(`[${thisFilePath}]› Cannot delete nonexistent document.`);
    return { success: true };
  }

  /// document exists, so grab ID to locate for deletion
  const documentId = e.uuid(existenceResult.id);

  try {
    const deleteQuery = e.delete(e.Domain, domain => ({
      filter_single: e.op(domain.id, "=", documentId)
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
