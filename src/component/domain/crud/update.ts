


/// import

import { log } from "dep/std.ts";

/// util

import {
  accessControl,
  client,
  objectIsEmpty,
  // personFromSession,
  stringTrim,
  validateDate
} from "src/utility/index.ts";

import { DomainStatusCode } from "../schema.ts";
import e from "dbschema";

import { default as getRecords } from "../utility/get-record.ts";
import { default as updateRecord } from "../utility/update-record.ts";

import type { DetailObject, LooseObject, StandardResponse } from "src/utility/index.ts";
import type { DomainUpdate } from "../schema.ts";

const thisFilePath = import.meta.filename;



/// export

export default async(_root, args: DomainUpdate, ctx, _info?): StandardResponse => {
  if (!await accessControl(ctx)) {
    const message = "Authentication failed.";
    log.warning(`[${thisFilePath}]› ${message}`);

    return {
      detail: null,
      error: {
        code: "TBA",
        message
      }
    };
  }

  // const owner = await personFromSession(ctx);

  // if (!owner) {
  //   log.warning(`[${thisFilePath}]› THIS ERROR SHOULD NEVER BE REACHED.`);
  //   return { detail: null, error: { code: "TBA", message: "Authorization error" }};
  // }

  const { params, updates } = args;

  if (objectIsEmpty(params) || objectIsEmpty(updates)) {
    const message = "Missing required parameter(s).";
    log.warning(`[${thisFilePath}]› ${message}`);

    return {
      detail: null,
      error: {
        code: "TBA",
        message
      }
    };
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

      case "record": {
        // TODO
        // : process/validate record
        query[key] = value[0];
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
    const message = "Vibe check failed.";
    log.warning(`[${thisFilePath}]› ${message}`);

    return {
      detail: response,
      error: {
        code: "TBA",
        message
      }
    };
  }

  if (query.expiry)
    query.expiry = e.datetime(new Date(query.expiry));

  if (query.owner) {
    const doesCustomerExist = e.select(e.Customer, customer => ({
      filter_single: e.op(customer.id, "=", e.uuid(query.owner))
    }));

    const customerExistenceResult = await doesCustomerExist.run(client);

    if (!customerExistenceResult) {
      const message = "Cannot update, customer does not exist.";
      log.warning(`[${thisFilePath}]› ${message}`);

      return {
        detail: response,
        error: {
          code: "TBA",
          message
        }
      };
    }

    query.owner = e.uuid(query.owner);
  }

  const doesDocumentExist = e.select(e.Domain, document => ({
    ...e.Domain["*"],
    extension: document.extension["*"],
    owner: document.owner["*"],
    filter_single: e.any(e.set(
      e.op(document.id, "?=", e.cast(e.uuid, params.id ?? e.set())),
      // ^^ via https://discord.com/channels/841451783728529451/1218640180286591247/1219720674352828497
      e.op(document.name, "=", params.name)
    ))
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (!existenceResult) {
    const message = "Cannot update nonexistent document.";
    log.warning(`[${thisFilePath}]› ${message}`);

    return {
      detail: response,
      error: {
        code: "TBA",
        message
      }
    };
  }

  /// NOTE
  /// : Updating a domain record is done in a different database; Postgres, via PowerDNS (external API)

  if (query.record) {
    // TODO
    // : add `hostname` to options

    // existenceResult.record = await getRecords(response.name);
    // return { detail: existenceResult };
    // return { detail: response };

    log.info(query.record);

    try {
      // const records = await updateRecord(query.record);
      // response = existenceResult
      // response.record = records;
      // console.log(records);
      // console.log(response);

      query.record.hostname = query.record.name;
      query.record.name = existenceResult.name;

      await updateRecord(query.record);

      response = existenceResult;
      response.record = await getRecords(existenceResult.name);

      return { detail: response };
    } catch(exception) {
      log.error(">>> womp");
      log.error(exception);

      return {
        detail: response,
        error: {
          code: "TBA",
          message: "idk yet"
        }
      };
    }
  }

  // curl -X PATCH \
  //   "http://localhost:8008/api/v1/servers/localhost/zones/example.org." \
  //   -H "Content-Type: application/json" \
  //   -H "X-API-Key: 1P@ssw0rd\!" \
  //   --data '{"rrsets": [{"name": "test.example.org.", "type": "A", "ttl": 3600, "changetype": "REPLACE", "records": [{"content": "192.168.0.5", "disabled": false}]}]}'

  try {
    const updateQuery = e.update(e.Domain, document => ({
      filter_single: e.op(document.id, "=", e.uuid(existenceResult.id)),
      set: {
        ...query,
        updated: e.datetime_of_transaction()
      }
    }));

    response = await e.select(updateQuery, document => ({
      ...e.Domain["*"],
      owner: document.owner["*"]
    })).run(client);

    return { detail: response };
  } catch(_) {
    const message = "Exception caught while updating document.";
    log.error(`[${thisFilePath}]› ${message}`);

    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10

    return {
      detail: response,
      error: {
        code: "TBA",
        message
      }
    };
  }
}
