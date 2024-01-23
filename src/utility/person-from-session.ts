


/// import

import { createClient } from "edgedb";

/// util

import { databaseParams } from "src/utility/index.ts";
import e from "dbschema";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i; /// https://github.com/afram/is-uuid/blob/master/lib/is-uuid.js



/// export

export default async (ctx) => {
  if (!ctx["x-session"])
    return false;

  const bearerTokenParts = ctx["x-session"].split(" ");
  let sessionToken = "";

  if (bearerTokenParts.length === 2 && bearerTokenParts[0].toLowerCase() === "bearer")
    sessionToken = String(bearerTokenParts[1]);
  else
    return false;

  if (!uuidRegex.test(sessionToken))
    return false; /// EdgeDB throws on invalid UUIDs

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
