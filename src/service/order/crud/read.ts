


///  I M P O R T

import { r } from "rethinkdb-ts";
import type { RDatum } from "rethinkdb-ts";

///  U T I L

import { databaseOptions } from "~util/index";

import type {
  OrderRequest,
  OrdersRequest
} from "~schema/index";

import type { LooseObject } from "~util/index";

const databaseName = "order";



///  E X P O R T

export async function get(suppliedData: OrderRequest) {
  const databaseConnection = await r.connect(databaseOptions);
  const { options } = suppliedData;
  const query: LooseObject = {};

  Object.entries(options).forEach(([key, value]) => {
    switch(key) {
      case "id":
        query[key] = String(value);
        break;

      default:
        break;
    }
  });

  let response: LooseObject = await r.table(databaseName)
    .filter(query)
    .limit(1)
    .run(databaseConnection);

  databaseConnection.close();

  if (response && response[0])
    response = response[0];
  else
    response = { id: "" };

  // console.log(response);
  // console.log(">>> response");

  return {
    detail: response
  };
}

export async function getMore(suppliedData: Partial<OrdersRequest>) {
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

  // TODO
  // : the above pagination is based on posts and dates...not applicable to what we are doing here
  // : ignore pagination for now, get options working

  // OPTIONS
  // emoji: boolean;
  // idn: boolean;
  // length: number;
  // number: boolean;
  // startsWith: string;

  // TODO
  // : RethinkDB rejects escaped unicode characters
  // : figure out a way around this
  // const emojiRegex = /((\p{Emoji})|(\p{Emoji_Presentation})|(\p{Emoji_Modifier})|(\p{Emoji_Modifier_Base})|(\p{Emoji_Component})|(\p{Extended_Pictographic}))*/gu;

  const response = await r.table(databaseName)
    .filter((document: RDatum) => {
      // TODO
      // : how to chain multiple options?

      // return document("ascii")
      //   .match(options && options.startsWith ? `^${options.startsWith}` : "");

      return document;
    })
    .orderBy(r.asc("name"))
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
