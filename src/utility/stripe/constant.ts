


/// import

import { load } from "dep/std.ts";

/// util

import { isDevelopment } from "../constant.ts";

const variables = await load();



/// export

export const STRIPE_PUBLISH = isDevelopment ?
  variables["STRIPE_TEST_PUBLISH"] :
  variables["STRIPE_LIVE_PUBLISH"];

export const STRIPE_SECRET = isDevelopment ?
  variables["STRIPE_TEST_SECRET"] :
  variables["STRIPE_LIVE_SECRET"];
