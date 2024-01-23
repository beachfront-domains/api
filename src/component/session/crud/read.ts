


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";

/// util

import {
  accessControl,
  databaseParams,
  maxPaginationLimit,
  objectIsEmpty
} from "src/utility/index.ts";

import e from "dbschema";

import type { SessionRequest, SessionsRequest } from "../schema.ts";

import type {
  DetailObject,
  LooseObject,
  StandardResponse,
  StandardPlentyResponse
} from "src/utility/index.ts";

const thisFilePath = "/src/component/session/crud/read.ts";



/// export

export async function get(_root, args: SessionRequest, ctx, _info?): StandardResponse {
  if (!await accessControl(ctx))
    return { detail: null };

  const client = createClient(databaseParams);
  const { params } = args;
  const query: LooseObject = {};
  let response: DetailObject | null = null;

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "id": {
        query[key] = String(value);
        break;
      }

      default: {
        break;
      }
    }
  });

  const doesDocumentExist = e.select(e.Session, document => ({
    ...e.Session["*"],
    filter_single: e.op(document.id, "=", e.uuid(query.id)),
    for: document.for["*"]
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (existenceResult)
    response = existenceResult;

  return {
    detail: response
  };
}

export async function getMore(_root, args: Partial<SessionsRequest>, _ctx?, _info?): StandardPlentyResponse {
  // TODO
  // : use `ctx` for access-control
  // : backwards cursor navigation (ex. previous page)
  const client = createClient(databaseParams);
  const { pagination, params } = args;
  const query: LooseObject = {};
  let allDocuments: Array<DetailObject> | null = null;
  let hasNextPage = false;
  let hasPreviousPage = false;
  let response: Array<DetailObject> | null = null;

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

  Object.entries((params as SessionsRequest["params"])).forEach(([key, value]) => {
    switch(key) {
      case "for":
      case "wildcard": {
        query[key] = String(value);
        break;
      }

      default: {
        break;
      }
    }
  });

  const baseShape = e.shape(e.Session, document => ({
    ...e.Session["*"],
    order_by: document.created
  }));

  if (query.wildcard) {
    allDocuments = await e.select(e.Session, document => ({
      ...baseShape(document),
      for: document.for["*"]
    })).run(client);
  } else {
    allDocuments = await e.select(e.Session, document => ({
      ...baseShape(document),
      filter: e.op(document.for.id, "=", e.uuid(query.for)),
      for: document.for["*"]
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
    response = await e.select(e.Session, document => ({
      ...baseShape(document),
      for: document.for["*"],
      limit,
      offset
    })).run(client);
  } else {
    response = await e.select(e.Session, document => ({
      ...baseShape(document),
      filter: e.op(document.for.id, "=", e.uuid(query.for)),
      for: document.for["*"],
      limit,
      offset
    })).run(client);
  }

  /// inspired by https://stackoverflow.com/a/62565528
  cursor = response && response.length > 0 ?
    btoa(response.slice(-1)[0].id) :
    null;

  if (response.length > 0) {
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
    detail: response,
    pageInfo: {
      cursor,
      hasNextPage,
      hasPreviousPage
    }
  };
}
