


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";

/// util

import {
  accessControl,
  databaseParams,
  maxPaginationLimit,
  objectIsEmpty,
  stringTrim,
  validateUUID
} from "src/utility/index.ts";

import e from "dbschema";

import type { Order, OrderRequest, OrdersRequest } from "../schema.ts";

import type {
  DetailObject,
  LooseObject,
  StandardResponse,
  StandardPlentyResponse
} from "src/utility/index.ts";

const thisFilePath = "/src/component/order/crud/read.ts";



/// export

export async function get(_root, args: OrderRequest, ctx, _info?): StandardResponse {
  if (!await accessControl(ctx))
    return { detail: null };

  const client = createClient(databaseParams);
  const { params } = args;
  const query = ({} as Order);
  let response: DetailObject | null = null;

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "id": {
        query[key] = stringTrim(String(value));
        break;
      }

      default:
        break;
    }
  });

  /// vibe check
  if (!query.id || !validateUUID(query.id)) {
    const error = "Missing required parameter(s).";
    log.warning(`[${thisFilePath}]› ${error}`);
    return { detail: response, error: { code: "TBA", message: error }};
  }

  /// existence check
  const doesDocumentExist = e.select(e.Order, document => ({
    ...e.Order["*"],
    filter_single: e.op(document.id, "=", e.uuid(query.id))
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (existenceResult)
    response = existenceResult;

  return {
    detail: response
  };
}

export async function getMore(_root, args: Partial<OrdersRequest>, ctx, _info?): StandardPlentyResponse {
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

  const client = createClient(databaseParams);
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

  let cursor = pagination && pagination.after && stringTrim(pagination.after) || null;
  let cursorId;
  let offset = 0;

  // TODO
  // : `created` and `updated` should be a range

  Object.entries((params as LooseObject)).forEach(([key, value]) => {
    switch(key) {
      case "customer": {
        query[key] = validateUUID(stringTrim(value)) ? stringTrim(value) : null;
        break;
      }

      default:
        break;
    }
  });

  if (params!.customer && !query.customer)
    return emptyResponse;

  const baseShape = e.shape(e.Order, document => ({
    ...e.Order["*"],
    order_by: document.created
  }));

  if (query.wildcard) {
    allDocuments = await e.select(e.Order, document => ({
      ...baseShape(document)
    })).run(client);
  } else {
    allDocuments = await e.select(e.Order, document => ({
      ...baseShape(document),
      filter: e.op(document.customer.id, "=", e.uuid(query.customer))
    })).run(client);
  }

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

  if (query.wildcard) {
    response = await e.select(e.Order, document => ({
      ...baseShape(document),
      limit,
      offset
    })).run(client);
  } else {
    response = await e.select(e.Order, document => ({
      ...baseShape(document),
      filter: e.op(document.customer.id, "=", e.uuid(query.customer)),
      limit,
      offset
    })).run(client);
  }

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
