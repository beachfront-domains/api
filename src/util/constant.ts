


///  I M P O R T

import cwd from "cwd";
import env from "vne";
import redis from "redis";

///  U T I L

import { name, version } from "~root/package.json";

const _env = env();
const _isDevelopment = process.env.NODE_ENV === "development";
const adminDatabasePassword = String(_env.database.password);



///  E X P O R T

export const apiPort = _env.port.api;

export const apiUrl = _isDevelopment ?
  _env.dev.api :
  _env.prod.api;

export const appName = name;
export const appVersion = version;
export const exportDirectory = `${cwd()}/exports`;

export const databaseOptions = {
  /// https://rethinkdb.com/api/javascript/connect
  /// https://github.com/rethinkdb/rethinkdb-ts/blob/master/test/config.ts
  buffer: 2, //
  db: _env.site.name.toLowerCase(),
  discovery: false, //
  host: "localhost",
  max: 5, //
  password: adminDatabasePassword,
  port: _env.port.database,
  silent: true, //
  user: "beachfrontAdmin"
};

export const environment = _isDevelopment ?
  "development" :
  "production";

export const filePort = _env.port.file;

export const fileUrl = _isDevelopment ?
  _env.dev.file :
  _env.prod.file;

export const redisClient = redis.createClient();
// export const regexForLinks = /(https?:\/\/.*?)(\S+)|\((https?:\/\/.*?)\)/g;
export const siteEmail = _env.site.email;
export const siteName = _env.site.name;

export const siteUrl = _isDevelopment ?
  _env.dev.app :
  _env.prod.app;

export const thesaurusKey = _env.thesaurus.api;
export const uploadDirectory = `${cwd()}/uploads`;
