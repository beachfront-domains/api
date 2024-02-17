


/// import

import { log } from "dep/std.ts";
import { toASCII } from "dep/x/tr46.ts";

/// util

import { accessControl, client, stringTrim } from "src/utility/index.ts";
import e from "dbschema";

import type { Extension, ExtensionRequest } from "../schema.ts";
import type { StandardBooleanResponse } from "src/utility/index.ts";

// const thisFilePath = "/src/component/extension/crud/delete.ts";
const thisFilePath = import.meta.filename;



/// export

export default async(_root, args: ExtensionRequest, ctx, _info?): StandardBooleanResponse => {
  if (!await accessControl(ctx))
    return { success: false };

  const { params } = args;
  const query = ({} as Extension);

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
      e.op(extension.id, "=", e.uuid(query.id)) :
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
    filter: e.op(domain.extension.id, "=", documentId),
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
}
