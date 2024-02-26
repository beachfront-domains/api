


/// util

import { client } from "src/utility/index.ts";
import e from "dbschema";



/// export

export default async (ctx) => {
  if (!ctx || !ctx["x-session"])
    return false;

  const bearerTokenParts = ctx["x-session"].split(" ");
  let sessionToken = "";

  if (bearerTokenParts.length === 2 && bearerTokenParts[0].toLowerCase() === "bearer")
    sessionToken = bearerTokenParts[1];
  else
    return false;

  // TODO
  // : check to ensure `sessionToken` is 128 characters? will this length ever change?

  const doesDocumentExist = e.select(e.Session, document => ({
    ...e.Session["*"],
    filter: e.op(document.token, "=", sessionToken),
    for: document.for["*"]
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (!existenceResult || !existenceResult[0])
    return false; /// session is nonexistent

  const existingSession = existenceResult[0];

  return {
    ...existingSession.for
  };
}
