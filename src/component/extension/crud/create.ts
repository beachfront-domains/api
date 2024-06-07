


/// import

import { log } from "dep/std.ts";
import { toASCII } from "dep/x/tr46.ts";

/// util

import { accessControl, client, stringTrim } from "src/utility/index.ts";
import { ExtensionTier } from "../schema.ts";
import e from "dbschema";

import type { DetailObject, StandardResponse } from "src/utility/index.ts";
import type { Extension, ExtensionCreate } from "../schema.ts";

// const thisFilePath = "/src/component/extension/crud/create.ts";
const thisFilePath = import.meta.filename;



/// export

export default async(_root, args: ExtensionCreate, ctx, _info?): StandardResponse => {
  if (!await accessControl(ctx))
    return { detail: null };

  const { params } = args;
  const query = ({} as Extension);
  let response: DetailObject | null = null;

  function stringifyArrayContents(arr) {
    // TODO
    // : figure out how to make `Array.from(new Set())` work without causing `deno check` errors
    return arr.map(item => String(item));
  }

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "pairs":
      case "premium": {
        query[key] = stringifyArrayContents(value);
        break;
      }

      case "name": {
        query[key] = toASCII(String(value));
        break;
      }

      case "registry": {
        query[key] = stringTrim(String(value));
        break;
      }

      case "tier": {
        query[key] = ExtensionTier[stringTrim(String(value).toUpperCase())] === stringTrim(String(value).toUpperCase()) ?
          ExtensionTier[stringTrim(String(value).toUpperCase())] :
          ExtensionTier.DEFAULT;
        break;
      }

      default:
        break;
    }
  });

  /// vibe check
  if (!query.name || !query.registry) {
    const error = "Missing required parameter(s).";
    log.warn(`[${thisFilePath}]› ${error}`);
    return { detail: response }; // error: [{ code: "TBA", message: error }]
  }

  const doesDocumentExist = e.select(e.Extension, extension => ({
    ...e.Extension["*"],
    filter_single: e.op(extension.name, "=", query.name)
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (existenceResult) {
    log.warn(`[${thisFilePath}]› Existing document returned.`);
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
}
