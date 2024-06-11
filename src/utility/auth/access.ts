


/// import

import { elliptic } from "dep/x/elliptic.ts";
import { load, v1 } from "dep/std.ts";
// import { Buffer } from "https://deno.land/std@0.224.0/io/mod.ts";
// import { Buffer } from "https://deno.land/std@0.139.0/node/buffer.ts";
// import { Buffer } from "node:buffer";
// npm:@types/node

/// util

import { client } from "src/utility/index.ts";
import e from "dbschema";
import { decode as base64decode, encode as base64encode } from "./helper.ts";

const { eddsa: EdDSA } = elliptic;
const ec = new EdDSA("ed25519");
const env = await load();



/// export

export async function accessControl(ctx) {
  if (!ctx || !ctx["x-session"])
    return false;

  const bearerTokenParts = ctx["x-session"].split(" ");
  let sessionId = "";

  if (bearerTokenParts.length === 2 && bearerTokenParts[0].toLowerCase() === "bearer")
    sessionId = bearerTokenParts[1];
  else
    return false;

  const doesDocumentExist = e.select(e.Session, document => ({
    ...e.Session["*"],
    // filter: e.op(document.token, "=", sessionToken),
    filter: e.op(document.id, "=", e.uuid(sessionId)),
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

export function createSessionToken(customerId: string) {
  /// please note that this function does not verify customerId
  const key = ec.keyFromSecret(env["keySecret"]); /// privateKey
  const uuid = v1.generate();

  const signature = key.sign(
    base64encode(`${customerId}+${uuid}`)
  ).toHex();

  return `${uuid}:${signature}`;
}

// Helper function to convert hex string to byte array
function hexToBytes(hex: string) {
  const bytes = [];

  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }

  return bytes;
}

// export function decodeSessionToken(token: string) {
//   const [uuid, signatureHex] = token.split(":");
//   return { uuid, signatureHex };
// }

export function verifySessionToken(token: string, customerId: string) {
  // console.log("\n——— customerId");
  // console.log(customerId);
  // console.log(token);
  // console.log("");
  const key = ec.keyFromSecret(env["keySecret"]); /// privateKey
  const publicKey = key.getPublic();
  // console.log(Object.keys(key));

  // Split the token to get UUID and signature
  const [uuid, signatureHex] = token.split(":");

  // console.log(uuid);
  // console.log(signatureHex);

  // Reconstruct the signed string
  const base64SignedString = base64encode(`${customerId}+${uuid}`);

  // Convert the token from hex to bytes
  // const signature = Buffer.from(new Buffer(signatureHex), "hex");

  // Convert the token from hex to byte array
  const signatureBytes = hexToBytes(signatureHex);

  // Verify the signature
  // console.log(ec.verify(base64SignedString, signatureBytes, publicKey));
  return ec.verify(base64SignedString, signatureBytes, publicKey);
}

// TODO
// : after verifying, decode the token and return the session ID

// export function decodeSessionToken(token: string, customerId: string) {
//   const key = ec.keyFromSecret(env["keySecret"]); // privateKey
//   const publicKey = key.getPublic();

//   // Reconstruct the signed string
//   const signedString = `${customerId}+${v1.generate()}`;
//   const base64SignedString = base64encode(signedString);

//   console.log(signedString);
//   console.log(base64SignedString);

//   // Convert the token from hex to bytes
//   // const signature = Buffer.from(token, "hex");

//   // Verify the signature
//   // return publicKey.verify(base64SignedString, signature);

//   console.log(">>> decodeSessionToken\n");
//   console.log(new Buffer.from(token, "hex"));
//   // console.log(publicKey.verify(token, key));
//   // console.log(signature);
//   // console.log(publicKey.verify(base64SignedString, signature));
//   console.log("...ok");
//   console.log("\n");

//   // console.log(key._secret);
//   // console.log(key._pubBytes);
//   // console.log(key.eddsa.hash(token));
//   // console.log(key.inspect(token));
//   // console.log(key.getPublic(key).toHex());

//   return null;
// }

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
