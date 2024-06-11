


/// import

import { log } from "dep/std.ts";

/// util

import {
  accessControl,
  client,
  decode,
  maxPaginationLimit,
  objectIsEmpty,
  verify
} from "src/utility/index.ts";

import { decode as base64decode } from "src/utility/auth/helper.ts";
import { /*decodeSessionToken,*/ verifySessionToken } from "src/utility/auth/access.ts";

import e from "dbschema";

import type { SessionRequest, SessionsRequest } from "../schema.ts";

import type {
  DetailObject,
  LooseObject,
  StandardResponse,
  StandardPlentyResponse
} from "src/utility/index.ts";

// const thisFilePath = "/src/component/session/crud/read.ts";
const thisFilePath = import.meta.filename;



/// export

export async function get(_root, args: SessionRequest, ctx, _info?): StandardResponse {
  // if (!await accessControl(ctx))
  //   return { detail: null };
  // console.log("\n>>> args");
  // console.log(args);

  const { params } = args;
  const query: LooseObject = {};
  let response: DetailObject | null = null;

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      // case "for": {
      //   query[key] = base64decode(String(value)) || null;
      // }

      case "for":
      case "id":
      case "token": {
        query[key] = String(value);
        break;
      }

      default: {
        break;
      }
    }
  });

  /// vibe check
  // if (query.for && !query.token || !query.for && query.token) {
  //   const err = "Missing required parameter(s).";

  //   log.warn(`[${thisFilePath}]› ${err}`);
  //   return { detail: response, error: { code: "TBA", message: err } };
  // }

  /// validate token
  if (query.token) {
    if (query.token && !verifySessionToken(query.token, query.for)) {
      const err = "Token is invalid.";

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response, error: { code: "TBA", message: err } };
    }
  }

  /// ensure focus of session exists
  const doesCustomerExist = e.select(e.Customer, customer => ({
    ...e.Customer["*"],
    filter_single: e.op(customer.id, "=", e.uuid(query.for))
  }));

  const customerExistenceResult = await doesCustomerExist.run(client);

  if (!customerExistenceResult) {
    log.warn(`[${thisFilePath}]› Customer doesn't exist.`);
    return { detail: response };
  }

  // TODO
  // : make sure `existenceResult.for` matches `for`

  const doesSessionExist = e.select(e.Session, document => ({
    ...e.Session["*"],
    filter_single: e.any(e.set(
      e.op(document.token, "?=", query.token),
      e.op(document.id, "?=", e.cast(e.uuid, query.id ?? e.set()))
      // ^^ via https://discord.com/channels/841451783728529451/1218640180286591247/1219720674352828497
    )),
    for: document.for["*"]
  }));

  const existenceResult = await doesSessionExist.run(client);

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
  const { pagination, params } = args;
  const query: LooseObject = {};
  let allDocuments: Array<DetailObject> | null = null;
  let hasNextPage = false;
  let hasPreviousPage = false;
  let response: Array<DetailObject> | null = null;

  if (objectIsEmpty(params)) {
    log.warn(`[${thisFilePath}]› Missing required parameter(s).`);

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
    btoa((response as Array<any>).slice(-1)[0].id) :
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
