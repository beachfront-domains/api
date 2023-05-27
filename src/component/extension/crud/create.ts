


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";
import { toASCII } from "dep/x/tr46.ts";

/// util

import { accessControl, databaseParams, stringTrim } from "src/utility/index.ts";
import e from "dbschema";

import type { DetailObject, LooseObject, StandardResponse } from "src/utility/index.ts";
import type { ExtensionCreate } from "../schema.ts";

const thisFilePath = "/src/component/extension/crud/create.ts";



/// export

export default (async(_root, args: ExtensionCreate, ctx, _info?) => {
  if (!await accessControl(ctx))
    return null;

  const client = createClient(databaseParams);
  const { params } = args;
  const query: LooseObject = {};
  let response: DetailObject | null = null;

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "name": {
        query[key] = toASCII(value);
        break;
      }

      case "registry": {
        query[key] = stringTrim(value);
        break;
      }

      default:
        break;
    }
  });

  /// vibe check
  if (!query.name || !query.registry) {
    const error = "Missing required parameter(s).";
    log.warning(`[${thisFilePath}]› ${error}`);
    return { detail: response, error: [{ code: "TBA", message: error }] };
  }

  const doesDocumentExist = e.select(e.Extension, extension => ({
    ...e.Extension["*"],
    filter_single: e.op(extension.name, "=", query.name)
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (existenceResult) {
    log.warning(`[${thisFilePath}]› Existing document returned.`);
    return { detail: existenceResult }; /// document exists, return it
  }

  try {
    const newDocument = e.insert(e.Extension, { ...query });
    const databaseQuery = e.select(newDocument, () => ({ ...e.Extension["*"] }));

    response = await databaseQuery.run(client);

    return { detail: response };
  } catch(_) {
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while creating document.`);
    return { detail: response };
  }
}) satisfies StandardResponse;
