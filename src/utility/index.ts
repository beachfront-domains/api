


///  U T I L

import {
  apiPort,
  apiURL,
  appName,
  appVersion,
  coinmarketcapKey,
  databaseOptions,
  environment,
  keyOpenNode,
  registryAPI,
  siteEmail,
  siteName,
  siteURL,
  thesaurusKey
} from "./constant";

import eddsa from "./eddsa";
import errorLogger from "./error-logger";
import generateGuid from "./generate-guid";
import hent from "./hent";
import { objectCompare } from "./object-compare";
import removeFromArray from "./remove-from-array";
import regexZeroWidth from "./regex/zerowidth";

import type { LooseObject } from "./interface";



///  E X P O R T

export {
  apiPort,
  apiURL,
  appName,
  appVersion,
  coinmarketcapKey,
  databaseOptions,
  eddsa,
  environment,
  errorLogger,
  generateGuid,
  hent,
  keyOpenNode,
  objectCompare,
  regexZeroWidth,
  registryAPI,
  removeFromArray,
  siteEmail,
  siteName,
  siteURL,
  thesaurusKey
};

export type {
  LooseObject
};
