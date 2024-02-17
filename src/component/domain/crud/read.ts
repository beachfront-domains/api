


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
  stringTrim,
  validateUUID
} from "src/utility/index.ts";

import e from "dbschema";

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
    log.warning(`[${thisFilePath}]› ${error}`);
    return { detail: response, error: { code: "TBA", message: error }};
  }

  /// existence check
  const doesDocumentExist = e.select(e.Domain, document => ({
    ...e.Domain["*"],
    filter_single: orOperation(
      e.op(document.id, "=", e.uuid(query.id)),
      e.op(document.name, "=", query.name)
    )
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (existenceResult)
    response = existenceResult;

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
    log.warning(`[${thisFilePath}]› Missing required parameter(s).`);
    return emptyResponse;
  }

  const limit = !pagination || (!pagination.first || isNaN(pagination.first)) ?
    20 :
    pagination.first;

  if (limit > maxPaginationLimit)
    return emptyResponse;

  let cursor = pagination && pagination.after && String(pagination.after) || null;
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
    order_by: document.created
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
    try {
      cursorId = atob(cursor);
    } catch(_) {
      cursorId = null;
    }

    allDocuments.find((document, index) => {
      if (document.id === cursorId)
        offset = index + 1;
    });
  }

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
  })).run(client);

  /// inspired by https://stackoverflow.com/a/62565528
  cursor = response && response.length > 0 ?
    btoa(response.slice(-1)[0].id) :
    null;

  if (response && response.length > 0) {
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

  return {
    detail: response,
    pageInfo: {
      cursor,
      hasNextPage,
      hasPreviousPage
    }
  };
}
