


//  U T I L S

import {
  appPort,
  appTagline,
  appUrl,
  databaseOptions,
  exportDirectory,
  redisClient,
  regexForLinks,
  siteName,
  siteUrl,
  weekInSeconds
} from "./variables";

import { appName, appVersion } from "./app";
import checkOptions from "./check-options";
import emailBlacklist from "./blacklist-email";
import emailTemplate from "./email-template";
import { environment, isDevelopment } from "./environment";
import generateGuid from "./generate-guid";
import generateToken from "./generate-token";
import generateTokenLink from "./generate-token-link";
import { log } from "./logger";
import loginDefault from "./email-type-link";
import loginToken from "./email-type-token";
import newTokenEmail from "./email-type-new-token";
import newUserEmail from "./email-type-new-user";
import notificationEmail from "./email-type-notification";
import { objectCompare } from "./object-compare";
import { pathContents } from "./path-contents";
import removeFromArray from "./remove-from-array";
import reportError from "./report-error";
import usernameBlacklist from "./blacklist-username";
import validateEmail from "./validate-email";
import verifyHash from "./verify-hash";
import verifyProof from "./verify-proof";

import ensureDatabase from "./database/ensure-database";
import ensureTable from "./database/ensure-table";



//  E X P O R T S

export {
  appName,
  appPort,
  appTagline,
  appUrl,
  appVersion,
  checkOptions,
  databaseOptions,
  emailBlacklist,
  emailTemplate,
  ensureDatabase,
  ensureTable,
  environment,
  exportDirectory,
  generateGuid,
  generateToken,
  generateTokenLink,
  siteUrl,
  isDevelopment,
  log,
  loginDefault,
  loginToken,
  newTokenEmail,
  newUserEmail,
  notificationEmail,
  objectCompare,
  pathContents,
  redisClient,
  regexForLinks,
  removeFromArray,
  reportError,
  siteName,
  usernameBlacklist,
  validateEmail,
  verifyHash,
  verifyProof,
  weekInSeconds
};
