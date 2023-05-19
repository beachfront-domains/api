


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";
import { toASCII } from "dep/x/tr46.ts";

/// util

import { accessControl, databaseOptions, stringTrim } from "src/utility/index.ts";
import { DomainStatusCode } from "../schema.ts";
import e from "dbschema";

import type { DetailObject, LooseObject, StandardResponse } from "src/utility/index.ts";
import type { ExtensionUpdate } from "../schema.ts";

const thisFilePath = "/src/component/extension/crud/update.ts";



/// export

export default (async(_root, args: ExtensionUpdate, ctx, _info?) => {
  if (!await accessControl(ctx))
    return null;

  const { params, updates } = args;

  if (objectIsEmpty(params) || objectIsEmpty(updates)) {
    log.warning(`[${thisFilePath}]› Missing required parameter(s).`);
    return { detail: null };
  }

  const client = createClient(databaseOptions);
  const query: LooseObject = {};
  let response: DetailObject | null = null;

  Object.entries(updates).forEach(([key, value]) => {
    switch(key) {
      case "registry": {
        query[key] = stringTrim(value);
        break;
      }

      default:
        break;
    }
  });

  const doesDocumentExist = e.select(e.Extension, extension => ({
    filter_single: e.op(extension.id, "=", e.uuid(stringTrim(params.id)))
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (!existenceResult) {
    log.warning(`[${thisFilePath}]› Cannot update nonexistent document.`);
    return { detail: response };
  }

  try {
    const updateQuery = e.update(e.Extension, extension => ({
      filter_single: e.op(extension.id, "=", e.uuid(existenceResult.id)),
      set: {
        ...query,
        updated: e.datetime_of_transaction()
      }
    }));

    response = await e.select(updateQuery, () => ({
      ...e.Extension["*"]
    })).run(client);

    return { detail: response };
  } catch(_) {
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while updating document.`);
    return { detail: response };
  }
}) satisfies StandardResponse;
