


///  I M P O R T

import cwd from "cwd";
import env from "vne";

///  U T I L

import { name, version } from "~root/package.json";

const { coinmarketcap, database, dev, port, prod, site, thesaurus } = env();
const isDevelopment = process.env.NODE_ENV && process.env.NODE_ENV === "development";



///  E X P O R T

export const apiPort = port.api;
export const apiURL = isDevelopment ? dev.api : prod.api;

export const appName = name;
export const appVersion = version;
export const coinmarketcapKey = coinmarketcap.api;

export const databaseOptions = {
  //> https://rethinkdb.com/api/javascript/connect
  //> https://github.com/rethinkdb/rethinkdb-ts/blob/master/test/config.ts
  buffer: 2, //
  db: site.name.toLowerCase(),
  discovery: false, // TODO: check if this should be true in production
  host: "localhost",
  max: 5, // TODO: check if this should be more in production
  password: database.password,
  port: port.database,
  silent: !isDevelopment,
  // silent: true, // TODO: check if this should be false in production
  user: "admin" // supposed to be beachfrontAdmin
};

export const environment = isDevelopment ? "development" : "production";
export const keyOpenNode = isDevelopment ? dev.opennode : prod.opennode;
export const registryAPI = isDevelopment ? "http://localhost:5454" : "https://api.neuenet";
export const siteEmail = site.email;
export const siteName = site.name;
export const siteURL = isDevelopment ? dev.app : prod.app;
export const thesaurusKey = thesaurus.api;
