


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";

/// util

import {
  accessControl,
  databaseParams,
  maxPaginationLimit,
  objectIsEmpty,
  stringTrim
} from "src/utility/index.ts";

import e from "dbschema";

import type { CustomerRequest, CustomersRequest } from "../schema.ts";

import type {
  DetailObject,
  LooseObject,
  StandardResponse,
  StandardPlentyResponse
} from "src/utility/index.ts";

const thisFilePath = "/src/component/customer/crud/read.ts";



/// export

export const get = async(_root, args: CustomerRequest, ctx, _info?): StandardResponse => {
  if (!await accessControl(ctx))
    return { detail: null };

  const client = createClient(databaseParams);
  const { params } = args;
  const query = ({} as LooseObject);
  let response: DetailObject | null = null;

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "email":
      case "id": {
        query[key] = stringTrim(value);
        break;
      }

      default:
        break;
    }
  });

  const doesDocumentExist = e.select(e.Customer, customer => ({
    ...e.Customer["*"],
    // TODO
    // : https://github.com/edgedb/edgedb-js/issues/347 : https://discord.com/channels/841451783728529451/1103366864937160846
    filter_single: query.id ?
      e.op(customer.id, "=", e.uuid(query.id)) :
      e.op(customer.email, "=", query.email)
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (existenceResult)
    response = existenceResult;

  return {
    detail: response
  };
};

export const getMore = async(_root, args: CustomersRequest, ctx, _info?): StandardPlentyResponse => {
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

  const client = createClient(databaseParams);
  const { pagination, params } = args;
  const query = ({} as LooseObject);
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

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "timezone": {
        query[key] = String(value);
        break;
      }

      case "staff":
      case "verified": {
        query[key] = Number(value);
        break;
      }

      default: {
        break;
      }
    }
  });

  const baseShape = e.shape(e.Customer, document => ({
    ...e.Customer["*"],
    order_by: document.created
  }));

  if (query.wildcard) {
    allDocuments = await e.select(e.Customer, document => ({
      ...baseShape(document)
    })).run(client);
  } else {
    allDocuments = await e.select(e.Customer, document => ({
      ...baseShape(document),
      // TODO
      // : https://github.com/edgedb/edgedb-js/issues/347 : https://discord.com/channels/841451783728529451/1103366864937160846
      filter: query.timezone ?
        e.op(document.timezone, "=", query.timezone) :
          query.staff ?
            e.op(document.staff, "=", query.staff) :
              query.verified ?
                e.op(document.verified, "=", query.verified) :
                  undefined
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
    response = await e.select(e.Customer, document => ({
      ...baseShape(document),
      limit,
      offset
    })).run(client);
  } else {
    response = await e.select(e.Customer, document => ({
      ...baseShape(document),
      // TODO
      // : https://github.com/edgedb/edgedb-js/issues/347 : https://discord.com/channels/841451783728529451/1103366864937160846
      filter: query.timezone ?
        e.op(document.timezone, "=", query.timezone) :
          query.staff ?
            e.op(document.staff, "=", query.staff) :
              query.verified ?
                e.op(document.verified, "=", query.verified) :
                  undefined,
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
};
