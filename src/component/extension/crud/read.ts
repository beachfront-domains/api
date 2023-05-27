


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";
import { toASCII } from "dep/x/tr46.ts";

/// util

import {
  accessControl,
  databaseParams,
  maxPaginationLimit,
  objectIsEmpty,
  stringTrim
} from "src/utility/index.ts";

import e from "dbschema";

import type { ExtensionRequest, ExtensionsRequest } from "../schema.ts";

import type {
  DetailObject,
  LooseObject,
  StandardResponse,
  StandardPlentyResponse
} from "src/utility/index.ts";

const thisFilePath = "/src/component/extension/crud/read.ts";



/// export

export const get = (async(_root, args: ExtensionRequest, ctx, _info?) => {
  if (!await accessControl(ctx))
    return null;

  const client = createClient(databaseParams);
  const { params } = args;
  const query: LooseObject = {};
  let response: DetailObject | null = null;

  Object.entries(options).forEach(([key, value]) => {
    switch(key) {
      case "id": {
        query[key] = stringTrim(value);
        break;
      }

      case "name": {
        query[key] = toASCII(value);
        break;
      }

      default:
        break;
    }
  });

  const doesDocumentExist = e.select(e.Extension, extension => ({
    ...e.Extension["*"],
    // TODO
    // : https://github.com/edgedb/edgedb-js/issues/347 : https://discord.com/channels/841451783728529451/1103366864937160846
    filter_single: query.id ?
      e.op(extension.id, "=", e.uuid(query.id)) :
      e.op(extension.name, "=", query.name)
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (existenceResult)
    response = existenceResult;

  return {
    detail: response
  };
}) satisfies StandardResponse;

export const getMore = (async(_root, args: Partial<ExtensionsRequest>, ctx, _info?) => {
  if (!await accessControl(ctx))
    return null;

  const client = createClient(databaseParams);
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

  let cursor = pagination && pagination.after && stringTrim(pagination.after) || null;
  let cursorId;
  let offset = 0;

  // TODO
  // : `created` and `updated` should be a range

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "registry": {
        query[key] = stringTrim(value);
        break;
      }

      default: {
        break;
      }
    }
  });

  const baseShape = e.shape(e.Extension, document => ({
    ...e.Extension["*"],
    order_by: document.created
  }));

  if (query.wildcard) {
    allDocuments = await e.select(e.Extension, document => ({
      ...baseShape(document)
    })).run(client);
  } else {
    allDocuments = await e.select(e.Extension, document => ({
      ...baseShape(document),
      filter: e.op(document.registry, "=", query.registry)
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
    response = await e.select(e.Extension, document => ({
      ...baseShape(document),
      limit,
      offset
    })).run(client);
  } else {
    response = await e.select(e.Extension, document => ({
      ...baseShape(document),
      filter: e.op(document.registry, "=", query.registry),
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
}) satisfies StandardPlentyResponse;
