


///  I M P O R T

import base64url from "base64url";
import ed25519 from "ed25519";

///  U T I L

import type { LooseObject } from "./interface";

const header = {
  alg: "EdDSA",
  typ: "JWT"
};



///  E X P O R T

export default (payload: LooseObject|string, privateKey: string) => {
  const privateKeySignature = ed25519.MakeKeypair(Buffer.from(privateKey, "base64"));
  const body = base64url.encode(
    JSON.stringify(header)) +
    "." +
    base64url.encode(JSON.stringify(payload)
  );
  const signature = ed25519.Sign(Buffer.from(body), privateKeySignature);

  return `${body}.${base64url.encode(signature)}`;
};



/// via https://github.com/ngti/jwt-ed25519
/// eddsa(payload, privateKey)
