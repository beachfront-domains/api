


///  I M P O R T

import env from "vne";
import jwt from "jsonwebtoken";

///  U T I L

import { apiUrl, siteUrl } from "~util/index";

const { key } = env();
const appSecret = key.secret;



///  E X P O R T

export default (guid: string, options: { expires?: string } = {}): string => {
  const expiresDefault = "30m";

  const token = jwt.sign({
    // namespaced special claims
    // Add a customer's email address to an access token and use that to uniquely identify the customer.
    aud: siteUrl, // token audience
    auth: guid,
    // exp: 1311281970, // expires
    // iat: 1311280970, // issuedAt
    iss: apiUrl // token issuer
    // sub (subject): Subject of the JWT (the customer)
  }, appSecret, {
    // algorithm: "RS256", // why does this fail
    expiresIn: options.expires || expiresDefault
  });

  return token;
};
