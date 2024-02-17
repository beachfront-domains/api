


/// import

import { log } from "dep/std.ts";

/// util

import {
  accessControl,
  client,
  objectIsEmpty,
  stringTrim,
  validateDate
} from "src/utility/index.ts";

import { DomainStatusCode } from "../schema.ts";
import e from "dbschema";

import type { DetailObject, LooseObject, StandardResponse } from "src/utility/index.ts";
import type { DomainUpdate } from "../schema.ts";

const thisFilePath = import.meta.filename;



/// export

export default async(_root, args: DomainUpdate, ctx, _info?): StandardResponse => {
  if (!await accessControl(ctx))
    return { detail: null };

  const { params, updates } = args;

  if (objectIsEmpty(params) || objectIsEmpty(updates)) {
    log.warning(`[${thisFilePath}]› Missing required parameter(s).`);
    return { detail: null };
  }

  const query = ({} as LooseObject);
  let response: DetailObject | null = null;

  Object.entries(updates).forEach(([key, value]) => {
    switch(key) {
      case "expiry": {
        query[key] = validateDate(stringTrim(String(value))) ?
          new Date(stringTrim(String(value))) :
          null;

        break;
      }

      case "owner": {
        query[key] = stringTrim(String(value));
        break;
      }

      case "status": {
        query[key] = DomainStatusCode[stringTrim(String(value).toUpperCase())] === stringTrim(String(value).toUpperCase()) ?
          DomainStatusCode[stringTrim(String(value).toUpperCase())] :
          null;
        break;
      }

      default:
        break;
    }
  });

  /// vibe check
  if (updates.expiry && !query.expiry || updates.status && !query.status) {
    log.warning(`[${thisFilePath}]› Vibe check failed.`);
    return { detail: response };
  }

  if (query.expiry)
    query.expiry = e.datetime(new Date(query.expiry));

  if (query.owner) {
    const doesCustomerExist = e.select(e.Customer, customer => ({
      filter_single: e.op(customer.id, "=", e.uuid(query.owner))
    }));

    const customerExistenceResult = await doesCustomerExist.run(client);

    if (!customerExistenceResult) {
      log.warning(`[${thisFilePath}]› Cannot update, customer does not exist.`);
      return { detail: response };
    }

    query.owner = e.uuid(query.owner);
  }

  const doesDocumentExist = e.select(e.Domain, domain => ({
    filter_single: e.op(domain.id, "=", e.uuid(String(params.id)))
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (!existenceResult) {
    log.warning(`[${thisFilePath}]› Cannot update nonexistent document.`);
    return { detail: response };
  }

  try {
    const updateQuery = e.update(e.Domain, domain => ({
      filter_single: e.op(domain.id, "=", e.uuid(existenceResult.id)),
      set: {
        ...query,
        updated: e.datetime_of_transaction()
      }
    }));

    response = await e.select(updateQuery, domain => ({
      ...e.Domain["*"],
      owner: domain.owner["*"]
    })).run(client);

    return { detail: response };
  } catch(_) {
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while updating document.`);
    return { detail: response };
  }
}
