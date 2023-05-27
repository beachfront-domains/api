


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";

/// util

import {
  accessControl,
  databaseParams,
  maxPaginationLimit,
  stringTrim
} from "src/utility/index.ts";

import { PaymentKind } from "../schema.ts";
import e from "dbschema";

import type { PaymentMethodRequest, PaymentMethodsRequest } from "../schema.ts";
import type { DetailObject, LooseObject, StandardResponse } from "src/utility/index.ts";

const thisFilePath = "/src/component/payment/crud/read.ts";



/// export

export const get = (async(_root, args: PaymentMethodRequest, ctx, _info?) => {
  if (!await accessControl(ctx))
    return null;

  const client = createClient(databaseParams);
  const { params } = args;
  const query: LooseObject = {};
  let response: DetailObject | null = null;

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "id":
      case "vendorId": {
        query[key] = stringTrim(value);
        break;
      }

      default:
        break;
    }
  });

  const doesDocumentExist = e.select(e.Payment, payment => ({
    ...e.Payment["*"],
    customer: payment.customer["*"],
    // TODO
    // : https://github.com/edgedb/edgedb-js/issues/347 : https://discord.com/channels/841451783728529451/1103366864937160846
    filter_single: query.id ?
      e.op(payment.id, "=", e.uuid(query.id)) :
      e.op(payment.vendorId, "=", query.vendorId)
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (existenceResult)
    response = existenceResult;

  return {
    detail: response
  };
}) satisfies StandardResponse;

export const getMore = (async(_root, args: Partial<PaymentMethodsRequest>, ctx, _info?) => {
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

  let cursor = pagination && pagination.after && String(pagination.after) || null;
  let cursorId;
  let offset = 0;

  // TODO
  // : `created` and `updated` should be a range

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "customer": {
        query[key] = stringTrim(value);
        break;
      }

      case "kind": {
        query[key] = PaymentKind[stringTrim(value).toUpperCase()] === stringTrim(value).toUpperCase() ?
          stringTrim(value).toUpperCase() :
          null;
        break;
      }

      default: {
        break;
      }
    }
  });

  const baseShape = e.shape(e.Payment, document => ({
    ...e.Payment["*"],
    order_by: document.created
  }));

  if (query.wildcard) {
    allDocuments = await e.select(e.Payment, document => ({
      ...baseShape(document)
    })).run(client);
  } else {
    allDocuments = await e.select(e.Payment, document => ({
      ...baseShape(document),
      // TODO
      // : https://github.com/edgedb/edgedb-js/issues/347 : https://discord.com/channels/841451783728529451/1103366864937160846
      filter: query.customer ?
        e.op(document.customer, "=", e.uuid(query.customer)) :
          query.kind ?
            e.op(document.kind, "=", query.kind) :
              null
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
    response = await e.select(e.Payment, document => ({
      ...baseShape(document),
      limit,
      offset
    })).run(client);
  } else {
    response = await e.select(e.Payment, document => ({
      ...baseShape(document),
      // TODO
      // : https://github.com/edgedb/edgedb-js/issues/347 : https://discord.com/channels/841451783728529451/1103366864937160846
      filter: query.customer ?
        e.op(document.customer, "=", e.uuid(query.customer)) :
          query.kind ?
            e.op(document.kind, "=", query.kind) :
              null,
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
