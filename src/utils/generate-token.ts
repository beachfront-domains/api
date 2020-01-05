


//  I M P O R T S

import env from "vne";
import jwt from "jsonwebtoken";

//  U T I L S

import { isDevelopment } from "./environment";

const appSecret = env.key.secret;

const tokenAudience = isDevelopment ?
  env.dev.site :
  env.prod.site;

const tokenIssuer = isDevelopment ?
  env.dev.api :
  env.prod.api;

//  T Y P E

type Options = {
  expires?: number;
}



//  E X P O R T

export default (guid: string, options?: Options) => {
  const expiresDefault = "30m";

  options = options || {};

  const token = jwt.sign({ // Create JWT
    auth: guid,
    iss: tokenIssuer,
    aud: tokenAudience
  }, appSecret, { expiresIn: options.expires || expiresDefault });

  return token;
};
