


///  I M P O R T

import { r } from "rethinkdb-ts";
import type { RDatum } from "rethinkdb-ts";

///  U T I L

import { databaseOptions } from "~util/index";

import type {
  Customer,
  CustomerRequest,
  CustomersRequest
} from "~schema/index";

import type { LooseObject } from "~util/index";

const databaseName = "customer";



///  E X P O R T

export async function get(suppliedData: CustomerRequest): Promise<{ detail: Customer }> {
  const databaseConnection = await r.connect(databaseOptions);
  const { options } = suppliedData;
  const query: LooseObject = {};

  Object.entries(options).forEach(([key, value]) => {
    switch(key) {
      case "email":
      case "id":
      case "username":
        query[key] = String(value);
        break;

      default:
        break;
    }
  });

  let response: any = await r.table(databaseName)
    .filter((document: RDatum) => {
      if (query.username)
        return document("username").match(`(?i)^${query.username}$`);

      return query;
    })
    .limit(1)
    .run(databaseConnection);

  databaseConnection.close();

  if (response && response[0])
    response = response[0];
  else
    response = { id: "" };

  return {
    detail: response
  };
}

export async function getMore(suppliedData: Partial<CustomersRequest>) {
  const databaseConnection = await r.connect(databaseOptions);
  const { options, pagination } = suppliedData;

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

  const response = await r.table(databaseName)
    .filter(options)
    .orderBy(r.asc("created"))
    .limit(limit)
    .run(databaseConnection);

  databaseConnection.close();

  const cursor = response.length > 0 ?
    response.slice(-1)[0].created :
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
