


/// import

import { log } from "dep/std.ts";
import { toASCII } from "dep/x/tr46.ts";

/// util

import {
  accessControl,
  client,
  maxPaginationLimit,
  objectIsEmpty,
  orOperation,
  personFromSession,
  stringTrim,
  validateUUID
} from "src/utility/index.ts";

import e from "dbschema";
import { default as getRecords } from "../utility/get-record.ts";

import type { Domain, DomainRequest, DomainsRequest } from "../schema.ts";

import type {
  DetailObject,
  LooseObject,
  StandardResponse,
  StandardPlentyResponse
} from "src/utility/index.ts";

const thisFilePath = import.meta.filename;



/// export

export async function get(_root, args: DomainRequest, ctx, _info?): StandardResponse {
  if (!await accessControl(ctx))
    return { detail: null };

  const owner = await personFromSession(ctx);

  if (!owner) {
    log.warn(`[${thisFilePath}]› THIS ERROR SHOULD NEVER BE REACHED.`);
    return { detail: null, error: { code: "TBA", message: "Authorization error" }};
  }

  const { params } = args;
  const query = ({} as Domain);
  let response: DetailObject | null = null;

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "id": {
        query[key] = stringTrim(String(value));
        break;
      }

      case "name": {
        query[key] = toASCII(String(value));
        break;
      }

      default:
        break;
    }
  });

  /// vibe check
  if (params.id && !validateUUID(query.id)) {
    const error = "Missing required parameter(s).";
    log.warn(`[${thisFilePath}]› ${error}`);
    return { detail: response, error: { code: "TBA", message: error }};
  }

  /// existence check
  const doesDocumentExist = e.select(e.Domain, document => ({
    ...e.Domain["*"],
    extension: e.Extension["*"],
    owner: e.Customer["*"],
    filter_single: e.any(e.set(
      e.op(document.id, "?=", e.cast(e.uuid, query.id ?? e.set())),
      // ^^ via https://discord.com/channels/841451783728529451/1218640180286591247/1219720674352828497
      e.op(document.name, "=", query.name)
    ))
  }));

  try {
    const existenceResult = await doesDocumentExist.run(client);

    if (existenceResult) {
      if (existenceResult.owner.id !== owner.id)
        return { detail: null };

      response = existenceResult;
      response.record = await getRecords(response.name);
    }
  } catch(error) {
    console.log(error);
  }

  return {
    detail: response
  };
}

export async function getMore(_root, args: Partial<DomainsRequest>, ctx, _info?): StandardPlentyResponse {
  const emptyResponse = {
    detail: null,
    pageInfo: {
      cursor: null,
      hasNextPage: false,
      hasPreviousPage: false
    }
  };

  if (!await accessControl(ctx))
    return emptyResponse;

  const { pagination, params } = args;
  const query = ({} as LooseObject);
  let allDocuments: Array<any> | null = null; // Array<DetailObject> // TODO: find EdgeDB document type
  let hasNextPage = false;
  let hasPreviousPage = false;
  let response: Array<any> | null = null; // Array<DetailObject>

  if (objectIsEmpty(params)) {
    log.warn(`[${thisFilePath}]› Missing required parameter(s).`);
    return emptyResponse;
  }

  const limit = !pagination || (!pagination.first || isNaN(pagination.first)) ?
    20 :
    pagination.first;

  if (limit > maxPaginationLimit)
    return emptyResponse;

  const pageBackward = pagination && pagination.before && String(pagination.before).length > 0 || false;
  // let pageForward = false;

  let cursor = pagination && pagination.after && String(pagination.after) ||
    pagination && pagination.before && String(pagination.before)
    null;
  let cursorId;
  let offset = 0;

  // TODO
  // : `created` and `updated` should be a range

  Object.entries((params as LooseObject)).forEach(([key, value]) => {
    switch(key) {
      case "extension":
      case "owner": {
        query[key] = validateUUID(stringTrim(value)) ? stringTrim(value) : null;
        break;
      }

      default:
        break;
    }
  });

  if (params!.extension && !query.extension)
    return emptyResponse;

  if (params!.owner && !query.owner)
    return emptyResponse;

  const baseShape = e.shape(e.Domain, document => ({
    ...e.Domain["*"],
    extension: e.Extension["*"],
    // order_by: document.created,
    owner: e.Customer["*"]
  }));

  allDocuments = await e.select(e.Domain, document => ({
    ...baseShape(document),
    // filter: orOperation(
    //   e.op(document.extension.id, "=", e.uuid(query.extension)),
    //   e.op(document.owner.id, "=", e.uuid(query.owner))
    // )
    ...(query.extension ? {
      filter: e.op(document.extension.id, "=", e.uuid(query.extension))
    } : {}),
    ...(query.owner ? {
      filter: e.op(document.owner.id, "=", e.uuid(query.owner))
    } : {}),
  })).run(client);

  const totalDocuments = allDocuments.length;

  if (cursor) {
    // console.log(">>> cursor");
    // console.log(cursor);
    // console.log(atob(cursor));
    // console.log(btoa(cursor));

    try {
      cursorId = atob(cursor);
    } catch(_) {
      cursorId = null;
    }

    allDocuments.find((document, index) => {
      if (document.id === cursorId) {
        // console.log("cursorId     :", cursorId);
        // console.log("offset       :", offset);
        // offset = index + 1;

        offset = pageBackward ?
          (index - limit) - limit :
          index + 1;

        if (offset < 0)
          offset = 0;

        // console.log("pageBackward :", pageBackward);
        // console.log("index        :", index);
        // console.log("limit        :", limit);
        // console.log("offset       :", offset);
        // console.log("\n");
      }
    });
  }

  // console.log(">>> offset");
  // console.log(offset);

  response = await e.select(e.Domain, document => ({
    ...baseShape(document),
    // filter: orOperation(
    //   e.op(document.extension.id, "=", e.uuid(query.extension)),
    //   e.op(document.owner.id, "=", e.uuid(query.owner))
    // ),
    ...(query.extension ? {
      filter: e.op(document.extension.id, "=", e.uuid(query.extension))
    } : {}),
    ...(query.owner ? {
      filter: e.op(document.owner.id, "=", e.uuid(query.owner))
    } : {}),
    limit,
    offset
    // offset: pageBackward ? offset - limit : offset
  })).run(client);

  if (response.length > 0) {
    response = response.map(async(res) => {
      res.record = await getRecords(res.name);
      return res;
    });
  }

  const finalResponse = await Promise.all(response);

  /// inspired by https://stackoverflow.com/a/62565528
  cursor = finalResponse && finalResponse.length > 0 ?
    btoa(finalResponse.slice(-1)[0].id) :
    null;

  if (finalResponse && finalResponse.length > 0) {
    if (offset + limit >= totalDocuments)
      hasNextPage = false;
    else
      hasNextPage = true;

    if (offset > 0)
      hasPreviousPage = true;
    else
      hasPreviousPage = false;
  }

  // TODO
  // : unknown if full linked documents are returned

  // console.log(">>> finalResponse");
  // console.log(finalResponse);

  return {
    detail: finalResponse,
    pageInfo: {
      cursor,
      hasNextPage,
      hasPreviousPage
    }
  };
}
