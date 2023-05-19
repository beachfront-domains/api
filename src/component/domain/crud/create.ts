


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";
import { toASCII } from "dep/x/tr46.ts";

/// util

import { accessControl, databaseOptions } from "src/utility/index.ts";
import { DomainStatusCode } from "../schema.ts";
import dotCheck from "../utility/check-dot.ts";
import e from "dbschema";

import type { DetailObject, LooseObject, StandardResponse } from "src/utility/index.ts";
import type { DomainCreate } from "../schema.ts";

const thisFilePath = "/src/component/domain/crud/create.ts";



/// export

export default (async(_root, args: DomainCreate, ctx, _info?) => {
  if (!await accessControl(ctx))
    return null;

  const client = createClient(databaseOptions);
  const { params } = args;
  const query: LooseObject = {};
  let response: DetailObject | null = null;

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "expiry":
      case "extension":
      case "owner": {
        query[key] = String(value);
        break;
      }

      case "name": {
        query[key] = toASCII(String(value));
        break;
      }

      case "status": {
        query[key] = Object.values(DomainStatusCode).includes(String(value).toUpperCase()) ?
          String(value).toUpperCase() :
          null;
        break;
      }

      default:
        break;
    }
  });

  /// vibe check
  if (!query.expiry || !query.extension || !query.name) {
    const error = "Missing required parameter(s).";
    log.warning(`[${thisFilePath}]› ${error}`);
    return { detail: response, error: [{ code: "TBA", message: error }] };
  }

  if (!dotCheck(query.name)) {
    const error = "Invalid domain.";
    log.warning(`[${thisFilePath}]› ${error}`);
    return { detail: response, error: [{ code: "TBA", message: error }] };
  }

  const doesExtensionExist = e.select(e.Extension, extension => ({
    ...e.Extension["*"],
    filter_single: e.op(extension.id, "=", e.uuid(query.extension))
  }));

  const extensionExistenceResult = await doesExtensionExist.run(client);

  if (!extensionExistenceResult) {
    log.warning(`[${thisFilePath}]› Extension does not exist.`);
    return { detail: response, error: [{ code: "TBA", message: error }] };
  }

  if (String(query.name).split(".")[1] !== toASCII(extensionExistenceResult.name)) {
    log.warning(`[${thisFilePath}]› Domain does not match extension ID.`);
    return { detail: response, error: [{ code: "TBA", message: error }] };
  }

  const doesDocumentExist = e.select(e.Domain, domain => ({
    ...e.Domain["*"],
    filter_single: e.op(domain.name, "=", query.name)
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (existenceResult) {
    log.warning(`[${thisFilePath}]› Existing document returned.`);
    return { detail: existenceResult }; /// document exists, return it
  }

  try {
    const owner = await getOwner(ctx);

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
}) satisfies StandardResponse;



/// helper

async function getOwner(ctx) {
  const bearerTokenParts = ctx["x-session"].split(" ");
  let sessionToken = "";

  if (bearerTokenParts.length === 2 && bearerTokenParts[0].toLowerCase() === "bearer")
    sessionToken = String(bearerTokenParts[1]);
  else
    return false;

  const client = createClient(databaseOptions);

  const doesDocumentExist = e.select(e.Key, key => ({
    ...e.Key["*"],
    filter_single: e.op(key.id, "=", e.uuid(sessionToken)),
    owner: key.owner["*"]
  }));

  const existenceResult = await doesDocumentExist.run(client);

  return {
    ...existenceResult.owner
  };
}
