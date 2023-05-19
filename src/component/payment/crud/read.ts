


/// import

import { r } from "rethinkdb-ts";
import type { RDatum } from "rethinkdb-ts";

/// util

import { databaseName, emptyResponse } from "../utility/constant.ts";
import { databaseOptions } from "src/utility/index.ts";

import type {
  Customer,
  PaymentMethod,
  PaymentMethodRequest,
  PaymentMethodsRequest
} from "src/schema/index.ts";

import type { LooseObject } from "src/utility/index.ts";



/// export

export async function get(data: PaymentMethodRequest, context: Customer): Promise<{ detail: PaymentMethod }> {
  if (!context || !context.id)
    return emptyResponse;

  const databaseConnection = await r.connect(databaseOptions);
  const { options } = data;
  const query: LooseObject = {};

  Object.entries(options).forEach(([key, value]) => {
    switch(key) {
      case "id":
      case "vendorId":
        query[key] = String(value);
        break;

      default:
        break;
    }
  });

  const arrayResponse: PaymentMethod[] = await r.table(databaseName)
    .filter(query)
    .limit(1)
    .run(databaseConnection);

  let response: PaymentMethod;

  databaseConnection.close();

  // console.log(">>> response");
  // console.log(arrayResponse);

  if (arrayResponse && arrayResponse[0]) {
    response = arrayResponse[0];

    /// Ensure payment method customer ID matches context ID
    if (response.customer !== context.id)
      return emptyResponse;
  } else {
    return emptyResponse;
  }

  return { detail: response };
}

export async function getMore(data: Partial<PaymentMethodsRequest>) {
  const databaseConnection = await r.connect(databaseOptions);
  const { options, pagination } = data;

  // TODO
  // : pagination
  const pageInfo: LooseObject = {};
  let hasPreviousPage = true;
  let query: LooseObject = {};

  pagination && Object.entries(pagination).forEach(([key, value]) => (pageInfo[key] = value));

  if (!pagination) {
    pageInfo.after = new Date(await r.now().toISO8601().run(databaseConnection));
    pageInfo.first = 0;
    hasPreviousPage = false;
  }

  if (pagination && !pagination.after) {
    pageInfo.after = new Date(await r.now().toISO8601().run(databaseConnection));
    hasPreviousPage = false;
  }

  if (pagination && !pagination.first)
    pageInfo.first = 0;

  const limit = !pageInfo.first || isNaN(pageInfo.first) ?
    20 :
    pageInfo.first;

  const offset = !pageInfo.after ?
    new Date(await r.now().toEpochTime().run(databaseConnection)) :
    new Date(pageInfo.after);
  //

  // TODO
  // : the above pagination is based on posts and dates...not applicable to what we are doing here
  // : ignore pagination for now, get options working

  // customer: string; /// customer ID
  // kind: PaymentMethodKind;
  // vendor: PaymentMethodVendor;

  const response = await r.table(databaseName)
    .filter(options)
    .orderBy(r.asc("updated"))
    .limit(limit)
    .run(databaseConnection);

  databaseConnection.close();

  const cursor = response.length > 0 ?
    response.slice(-1)[0].name :
    null;

  return {
    detail: response,
    pageInfo: {
      cursor,
      hasNextPage: cursor ? true : false, /// ehh~
      hasPreviousPage
    }
  };
}
