


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";

/// util

import e from "dbschema";

import {
  accessControl,
  databaseParams,
  objectIsEmpty
} from "src/utility/index.ts";

import type { RecordUpdate } from "../schema.ts";

import type {
  DetailObject,
  LooseObject,
  StandardResponse
} from "src/utility/index.ts";

// const thisFilePath = "/src/component/record/crud/update.ts";
const thisFilePath = import.meta.filename;



/// export

export default async(_root, args: RecordUpdate, ctx, _info?): StandardResponse => {
  if (!await accessControl(ctx))
    return { detail: null };

  const { params, updates } = args;
  let response: DetailObject | null = null;

  if (objectIsEmpty(params) || objectIsEmpty(updates)) {
    log.warn(`[${thisFilePath}]› Missing required parameter(s).`);
    return { detail: response };
  }

  const client = createClient(databaseParams);
  const query = ({} as LooseObject);

  Object.entries(updates).forEach(([key, value]) => {
    switch(key) {
      case "ttl": {
        query[key] = Number(value);
        break;
      }

      default:
        break;
    }
  });

  const doesDocumentExist = e.select(e.dns.BaseRecord, record => ({
    filter_single: e.op(record.id, "=", e.uuid(String(params.id)))
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (!existenceResult) {
    log.warn(`[${thisFilePath}]› Cannot update nonexistent document.`);
    return { detail: response };
  }

  try {
    const updateQuery = e.update(e.dns.BaseRecord, record => ({
      filter_single: e.op(record.id, "=", e.uuid(existenceResult.id)),
      set: {
        ...query,
        updated: e.datetime_of_transaction()
      }
    }));

    response = await e.select(updateQuery, () => ({
      ...e.BaseRecord["*"]
    })).run(client);

    return { detail: response };
  } catch(_) {
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while updating document.`);
    return { detail: response };
  }
}
