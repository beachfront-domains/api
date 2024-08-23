


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
  prettyFilePath,
  stringTrim,
  validateUUID
} from "src/utility/index.ts";

import e from "dbschema";
import { default as getRecords } from "../utility/get-record.ts";

import type { Website, WebsiteRequest, WebsitesRequest } from "../schema.ts";

import type {
  DetailObject,
  LooseObject,
  StandardResponse,
  StandardPlentyResponse
} from "src/utility/index.ts";

const thisFilePath = prettyFilePath(import.meta.filename);



/// export

export async function get(_root, args: WebsiteRequest, ctx, _info?): StandardResponse {
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

  const { params } = args;
  const query = ({} as Website);
  let response: DetailObject | null = null;

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "domain": {
        query[key] = toASCII(String(value));
        break;
      }

      case "id": {
        query[key] = stringTrim(String(value));
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
  const doesDocumentExist = e.select(e.Website, document => ({
    ...e.Website["*"],
    domain: document.domain["*"],
    filter_single: e.any(e.set(
      e.op(document.id, "?=", e.cast(e.uuid, query.id ?? e.set())),
      // ^^ via https://discord.com/channels/841451783728529451/1218640180286591247/1219720674352828497
      e.op(document.domain.name, "=", query.domain)
    )),
    owner: document.owner["*"]
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (existenceResult)
    response = existenceResult;

  return {
    detail: response
  };
}

export async function getMore(_root, args: Partial<WebsitesRequest>, ctx, _info?): StandardPlentyResponse {
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
      case "owner": {
        query[key] = validateUUID(stringTrim(value)) ? stringTrim(value) : null;
        break;
      }

      default:
        break;
    }
  });

  if (params!.owner && !query.owner)
    return emptyResponse;

  const baseShape = e.shape(e.Website, document => ({
    ...e.Website["*"],
    domain: e.Domain["*"],
    // order_by: document.created,
    owner: e.Customer["*"]
  }));

  allDocuments = await e.select(e.Website, document => ({
    ...baseShape(document),
    // filter: orOperation(
    //   e.op(document.extension.id, "=", e.uuid(query.extension)),
    //   e.op(document.owner.id, "=", e.uuid(query.owner))
    // )
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

  response = await e.select(e.Website, document => ({
    ...baseShape(document),
    // filter: orOperation(
    //   e.op(document.extension.id, "=", e.uuid(query.extension)),
    //   e.op(document.owner.id, "=", e.uuid(query.owner))
    // ),
    ...(query.owner ? {
      filter: e.op(document.owner.id, "=", e.uuid(query.owner))
    } : {}),
    limit,
    offset
    // offset: pageBackward ? offset - limit : offset
  })).run(client);

  // if (response.length > 0) {
  //   response = response.map(async(res) => {
  //     res.record = await getRecords(res.name);
  //     return res;
  //   });
  // }

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

  return {
    detail: finalResponse,
    pageInfo: {
      cursor,
      hasNextPage,
      hasPreviousPage
    }
  };
}
