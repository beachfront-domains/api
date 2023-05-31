


/// import

import { createClient } from "edgedb";

/// util

import { databaseParams } from "src/utility/index.ts";
import e from "dbschema";



/// export

export default async (ctx) => {
  const bearerTokenParts = ctx["x-session"].split(" ");
  let sessionToken = "";

  if (bearerTokenParts.length === 2 && bearerTokenParts[0].toLowerCase() === "bearer")
    sessionToken = String(bearerTokenParts[1]);
  else
    return false;

  const client = createClient(databaseParams);

  const doesDocumentExist = e.select(e.Key, key => ({
    ...e.Key["*"],
    filter_single: e.op(key.id, "=", e.uuid(sessionToken)),
    owner: key.owner["*"]
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (!existenceResult)
    return false;

  return {
    ...existenceResult.owner
  };
}
