


/// import

import { load } from "dep/std.ts";

/// util

import { default as sortObject } from "./sort-object.ts";
import type { LooseObject } from "./interface.ts";



/// export

export const {
  // SECURITY
  keyEncryption,
  keySecret,
  keySigning,
  // PORTS
  portAPI,
  portApp,
  // SERVERS
  devAPI,
  devApp,
  prodAPI,
  prodApp,
  // SERVICES
  serviceCoinmarketcap,
  serviceDictionary,
  serviceMail,
  serviceNinja,
  serviceOpennodeDev,
  serviceOpennodeProd,
  servicePostmark,
  serviceResend,
  serviceSquareProductionApp,
  serviceSquareProductionToken,
  serviceSquareSandboxApp,
  serviceSquareSandboxToken,
  serviceStripePublic,
  serviceStripeSecret,
  serviceThesaurus,
  // DATABASE
  databasePassword,
  databasePort,
  databaseUser
} = sortObject(await load()) as LooseObject;
