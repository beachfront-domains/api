


/// import

import { log } from "dep/std.ts";
import { toASCII } from "dep/x/tr46.ts";

/// util

import {
  accessControl,
  client,
  personFromSession,
  prettyFilePath,
  stringTrim
} from "src/utility/index.ts";

import { Domain, DomainStatusCode } from "../schema.ts";
import dotCheck from "../utility/check-dot.ts";
import e from "dbschema";

import type { DetailObject, StandardResponse } from "src/utility/index.ts";
import type { DomainCreate } from "../schema.ts";

const thisFilePath = prettyFilePath(import.meta.filename);



/// export

export default async(_root, args: DomainCreate, ctx, _info?): StandardResponse => {
  if (!await accessControl(ctx)) {
    const message = "Authentication failed.";
    log.warn(`[${thisFilePath}]› ${message}`);

    return {
      detail: null,
      error: {
        code: "TBA",
        message
      }
    };
  }

  const { params } = args;
  const query = ({} as Domain);
  let response: DetailObject | null = null;

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "extension":
      case "owner": {
        query[key] = stringTrim(String(value));
        break;
      }

      case "expiry": {
        query[key] = new Date(value);
        break;
      }

      case "name": {
        query[key] = toASCII(String(value));
        break;
      }

      case "status": {
        query[key] = DomainStatusCode[stringTrim(String(value).toUpperCase())] === stringTrim(String(value).toUpperCase()) ?
          DomainStatusCode[stringTrim(String(value).toUpperCase())] :
          DomainStatusCode.PENDING_CREATE;
        break;
      }

      default:
        break;
    }
  });

  /// vibe check
  if (!query.expiry || !query.extension || !query.name) {
    const message = "Missing required parameter(s).";
    log.warn(`[${thisFilePath}]› ${message}`);

    return {
      detail: response,
      error: {
        code: "TBA",
        message
      }
    };
  }

  if (!dotCheck(query.name)) {
    const message = "Invalid domain.";
    log.warn(`[${thisFilePath}]› ${message}`);

    return {
      detail: response,
      error: {
        code: "TBA",
        message
      }
    };
  }

  const doesExtensionExist = e.select(e.Extension, extension => ({
    ...e.Extension["*"],
    filter_single: e.op(extension.id, "=", e.uuid(query.extension))
  }));

  const extensionExistenceResult = await doesExtensionExist.run(client);

  if (!extensionExistenceResult) {
    const message = "Extension does not exist.";
    log.warn(`[${thisFilePath}]› ${message}`);

    return {
      detail: response,
      error: {
        code: "TBA",
        message
      }
    };
  }

  if (String(query.name).split(".")[1] !== toASCII(extensionExistenceResult.name)) {
    const message = "Domain does not match extension ID.";
    log.warn(`[${thisFilePath}]› ${message}`);

    return {
      detail: response,
      error: {
        code: "TBA",
        message
      }
    };
  }

  const doesDocumentExist = e.select(e.Domain, domain => ({
    ...e.Domain["*"],
    filter_single: e.op(domain.name, "=", query.name)
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (existenceResult) {
    log.warn(`[${thisFilePath}]› Existing document returned.`);
    return { detail: existenceResult }; /// document exists, return it
  }

  try {
    const owner = await personFromSession(ctx);

    if (!owner) {
      const message = "THIS ERROR SHOULD NEVER BE REACHED.";
      log.warn(`[${thisFilePath}]› ${message}`);

      return {
        detail: response,
        error: {
          code: "TBA",
          message
        }
      };
    }

    const newDocument = e.insert(e.Domain, {
      ...query,
      extension: doesExtensionExist,
      owner: e.select(e.Customer, customer => ({
        filter_single: e.op(customer.id, "=", e.uuid(owner.id))
      }))
    });

    const databaseQuery = e.select(newDocument, domain => ({
      ...e.Domain["*"],
      extension: domain.extension["*"],
      owner: domain.owner["*"]
    }));

    response = await databaseQuery.run(client);

    return { detail: response };
  } catch(_) {
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while creating document.`);
    return { detail: response };
  }
}
