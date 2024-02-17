


/// import

import { log } from "dep/std.ts";

/// util

import {
  accessControl,
  client,
  maxPaginationLimit,
  objectIsEmpty,
  stringTrim
} from "src/utility/index.ts";

import e from "dbschema";

import type { Bag, BagRequest, BagsRequest } from "../schema.ts";

import type {
  DetailObject,
  LooseObject,
  StandardResponse,
  StandardPlentyResponse
} from "src/utility/index.ts";

// const thisFilePath = "/src/component/session/crud/read.ts";
const thisFilePath = import.meta.filename;



/// export

export async function get(_root, args: BagRequest, _ctx, _info?): StandardResponse {
  /// NOTE
  /// : this function doesn't need to be auth-gated

  const { params } = args;
  const query = ({} as Bag);
  let response: DetailObject | null = null;

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "id": {
        query[key] = stringTrim(value);
        break;
      }

      default:
        break;
    }
  });

  const doesDocumentExist = e.select(e.Bag, session => ({
    ...e.Bag["*"],
    customer: session.customer["*"],
    filter_single: e.op(session.id, "=", e.uuid(query.id))
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (existenceResult)
    response = existenceResult;

  return {
    detail: response
  };
}

export async function getMore(_root, args: Partial<BagsRequest>, ctx, _info?): StandardPlentyResponse {
  if (!await accessControl(ctx)) {
    return {
      detail: null,
      pageInfo: {
        cursor: null,
        hasNextPage: false,
        hasPreviousPage: false
      }
    };
  }

  const { pagination, params } = args;
  const query: LooseObject = {};
  let allDocuments: Array<any> | null = null; // Array<DetailObject> // TODO: find EdgeDB document type
  let hasNextPage = false;
  let hasPreviousPage = false;
  let response: Array<any> | null = null; // Array<DetailObject>

  if (objectIsEmpty(params)) {
    log.warning(`[${thisFilePath}]› Missing required parameter(s).`);

    return {
      detail: response,
      pageInfo: {
        cursor: null,
        hasNextPage,
        hasPreviousPage
      }
    };
  }

  const limit = !pagination || (!pagination.first || isNaN(pagination.first)) ?
    20 :
    pagination.first;

  if (limit > maxPaginationLimit) {
    return {
      detail: response,
      pageInfo: {
        cursor: null,
        hasNextPage,
        hasPreviousPage
      }
    };
  }

  let cursor = pagination && pagination.after && String(pagination.after) || null;
  let cursorId;
  let offset = 0;

  // TODO
  // : `created` and `updated` should be a range

  Object.entries((params as LooseObject)).forEach(([key, value]) => {
    switch(key) {
      case "customer": {
        query[key] = stringTrim(String(value));
        break;
      }

      default:
        break;
    }
  });

  const baseShape = e.shape(e.Bag, document => ({
    ...e.Bag["*"],
    order_by: document.created
  }));

  allDocuments = await e.select(e.Bag, document => ({
    ...baseShape(document),
    filter: e.op(document.customer.id, "=", e.uuid(query.customer))
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

  response = await e.select(e.Bag, document => ({
    ...baseShape(document),
    filter: e.op(document.customer.id, "=", e.uuid(query.customer)),
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
