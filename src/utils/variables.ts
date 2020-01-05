


//  I M P O R T S

import cwd from "cwd";
import env from "vne";
import redis from "redis";

//  U T I L S

import { isDevelopment } from "./environment";
const adminDatabasePassword = String(env.database.password);



//  E X P O R T S

export const appName = env.site.name;
export const appPort = env.port.api;
export const appTagline = env.site.tagline;
export const appUrl = isDevelopment ?
  env.dev.api :
  env.prod.api;
export const exportDirectory = cwd() + "/exports";
export const databaseOptions = {
  // https://rethinkdb.com/api/javascript/connect
  // https://github.com/rethinkdb/rethinkdb-ts/blob/master/test/config.ts
  buffer: 2, //
  db: env.site.name.toLowerCase(),
  discovery: false, //
  host: "localhost",
  max: 5, //
  // password: isDevelopment ? adminDatabasePassword : "", // TODO: Find a fix for this, FAST
  password: adminDatabasePassword,
  port: env.port.database,
  silent: true, //
  user: "admin" // default
};
export const redisClient = redis.createClient();
export const regexForLinks = /(https?:\/\/.*?)(\S+)|\((https?:\/\/.*?)\)/g;
export const siteName = env.site.name;
export const siteUrl = isDevelopment ?
  env.dev.site :
  env.prod.site;
export const weekInSeconds = 6.04e+8; // 604800;
