


/// import

import { load } from "dep/std.ts";

/// util

import { isDevelopment } from "../../constant.ts";

const variables = await load();



/// export

export const OPENNODE_KEY = isDevelopment ?
  variables["OPENNODE_DEVELOPMENT"] :
  variables["OPENNODE_PRODUCTION"];

export const OPENNODE_URL = isDevelopment ?
  "https://dev-api.opennode.com" :
  "https://api.opennode.com";
