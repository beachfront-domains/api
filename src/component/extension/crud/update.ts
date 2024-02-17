


/// import

import { log } from "dep/std.ts";

/// util

import {
  accessControl,
  client,
  objectIsEmpty,
  stringTrim
} from "src/utility/index.ts";

import { ExtensionTier } from "../schema.ts";
import e from "dbschema";

import type { DetailObject, StandardResponse } from "src/utility/index.ts";
import type { Extension, ExtensionUpdate } from "../schema.ts";

// const thisFilePath = "/src/component/extension/crud/update.ts";
const thisFilePath = import.meta.filename;



/// export

export default async(_root, args: ExtensionUpdate, ctx, _info?): StandardResponse => {
  if (!await accessControl(ctx))
    return { detail: null };

  const { params, updates } = args;

  if (objectIsEmpty(params) || objectIsEmpty(updates)) {
    log.warning(`[${thisFilePath}]› Missing required parameter(s).`);
    return { detail: null };
  }

  const query = ({} as Extension);
  let response: DetailObject | null = null;

  // TODO
  // : add `pairs` and `premium` to `updates`
  //   use `new Set` to eliminate duplicates

  function stringifyArrayContents(arr) {
    // TODO
    // : figure out how to make `Array.from(new Set())` work without causing `deno check` errors
    // : are we overwriting original values?
    return arr.map(item => String(item));
  }

  Object.entries(updates).forEach(([key, value]) => {
    switch(key) {
      case "pairs":
      case "premium": {
        query[key] = stringifyArrayContents(value);
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

  const doesDocumentExist = e.select(e.Extension, extension => ({
    filter_single: e.op(extension.id, "=", e.uuid(stringTrim(String(params.id))))
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
}
