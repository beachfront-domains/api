


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";
import { toASCII } from "dep/x/tr46.ts";

/// util

import { accessControl, databaseParams, stringTrim } from "src/utility/index.ts";
import e from "dbschema";

import type { ExtensionRequest } from "../schema.ts";
import type { LooseObject, StandardBooleanResponse } from "src/utility/index.ts";

const thisFilePath = "/src/component/extension/crud/delete.ts";



/// export

export default (async(_root, args: ExtensionRequest, ctx, _info?) => {
  if (!await accessControl(ctx))
    return null;

  const client = createClient(databaseParams);
  const { params } = args;
  const query: LooseObject = {};

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "id": {
        query[key] = stringTrim(value);
        break;
      }

      case "name": {
        query[key] = toASCII(value);
        break;
      }

      default:
        break;
    }
  });

  const doesDocumentExist = e.select(e.Extension, extension => ({
    filter_single: query.id ?
      e.op(extension.id, "=", e.uuid(extension.id)) :
      e.op(extension.name, "=", query.name)
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (!existenceResult) {
    log.warning(`[${thisFilePath}]› Cannot delete nonexistent document.`);
    return { success: true };
  }

  /// document exists, so grab ID to locate for deletion
  const documentId = e.uuid(existenceResult.id);

  /// ensure no domains exist
  const doDomainsExist = e.select(e.Domain, domain => ({
    filter: e.op(domain.extension, "=", documentId),
    limit: 2
  }));

  const domainExistenceResult = await doDomainsExist.run(client);

  if (!domainExistenceResult) {
    log.warning(`[${thisFilePath}]› Error deleting extension, at least one domain exists.`);
    return { success: false };
  }

  try {
    const deleteQuery = e.delete(e.Extension, extension => ({
      filter_single: e.op(extension.id, "=", documentId)
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
