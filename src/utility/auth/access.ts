


/// import

import { elliptic } from "dep/x/elliptic.ts";
import { load, v1 } from "dep/std.ts";

/// util

import { client } from "src/utility/index.ts";
import e from "dbschema";
import { encode as base64encode } from "./helper.ts";

const { eddsa: EdDSA } = elliptic;
const ec = new EdDSA("ed25519");
const env = await load();



/// export

export async function accessControl(ctx) {
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

  if (new Date(Number(existingSession.expires)).getTime() < new Date().getTime()) {
    /// session is expired, so let's delete it
    const deleteQuery = e.delete(e.Session, session => ({
      filter_single: e.op(session.id, "=", e.uuid(existingSession.id))
    }));

    await deleteQuery.run(client);
    return false;
  }

  // TODO
  // : increase `expires` window by two weeks every time this is accessed?
  //   or, every n times this is accessed?

  return true;
}

export function createSessionToken(memberID: string) {
  /// please note that this function doesn't verify memberID
  const key = ec.keyFromSecret(env["keySecret"]); // privateKey
  const hmm = `${memberID}+${v1.generate()}`;

  // import { generate } from "https://deno.land/std@0.212.0/uuid/v1.ts";
  console.log(">>> createSessionToken");
  console.log(hmm);
  console.log(memberID);

  return key.sign(base64encode(hmm)).toHex();
}

/*
- src/component/audit
  - /crud/read (getAudits)
    - the only exposed endpoint for audits

- src/component/login
  - /crud/create (createLogin)
  - /crud/delete (deleteLogin)
  - /crud/read   (getLogin...getLogins?)
    - after login is accessed and processed, delete it

- src/component/member (admin should be created during Pastry setup process)
  - /crud/create (createMember)
  - /crud/delete (deleteMember)
    - if member.role === ADMIN, don't delete...this should be done in the database itself
  - /crud/read   (getMember...getMembers?)
  - /crud/update (updateMember)

- src/component/registry (should be created during Pastry setup process)
  - /crud/create  (createRegistry)
  - /crud/read    (getRegistry)
  - /crud/update  (updateRegistry)

- src/component/session
  - /crud/create (createSession)
  - /crud/delete (deleteSession)
  - /crud/read   (getSession...getSessions?)
    - if session is expired, delete it
  - /crud/update (updateSession)
    - session has to be valid in order to be updated
*/
