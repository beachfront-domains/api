


/// util

import { client, orOperation } from "src/utility/index.ts";
import e from "dbschema";

import type { LoginRequest } from "../schema.ts";

import type {
  DetailObject,
  LooseObject,
  StandardResponse
} from "src/utility/index.ts";



/// export

export async function get(_root, args: LoginRequest, _ctx?, _info?): StandardResponse {
  /// this function needs to be accessible to non-authenticated folks
  const { params } = args;
  const query: LooseObject = {};
  let response: DetailObject | null = null;

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "email":
      case "id": {
        query[key] = String(value);
        break;
      }

      default: {
        break;
      }
    }
  });

  const doesDocumentExist = e.select(e.Login, document => ({
    ...e.Login["*"],
    // TODO
    // : https://github.com/edgedb/edgedb-js/issues/347 : https://discord.com/channels/841451783728529451/1103366864937160846
    // filter_single: query.id ?
    //   e.op(login.id, "=", e.uuid(query.id)) :
    //   e.op(login.email, "=", query.email),
    filter_single: orOperation(
      e.op(document.id, "=", e.uuid(query.id)),
      e.op(document.for.email, "=", query.email)
    ),
    for: document.for["*"]
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (existenceResult)
    response = existenceResult;

  // TODO
  // : delete login token after it is accessed

  return {
    detail: response
  };
}
