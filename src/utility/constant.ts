


///  I M P O R T

import cwd from "cwd";
import { Environment } from "square";
import { vne } from "vne";

///  U T I L

import { name, version } from "~root/package.json";

const { database, port, server, service, site } = vne();
const isDevelopment = process.env.NODE_ENV && process.env.NODE_ENV === "development";



///  E X P O R T

export const apiPort = port.api;
export const apiURL = isDevelopment ? server.dev.api : server.prod.api;

export const appName = name;
export const appVersion = version;
export const coinmarketcapKey = service.coinmarketcap;

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
export const keyOpenNode = isDevelopment ? service.opennode.dev : service.opennode.prod;
export const registryAPI = isDevelopment ? "http://localhost:5454" : "https://api.neuenet";
export const siteEmail = site.email;
export const siteName = site.name;
export const siteURL = isDevelopment ? server.dev.app : server.prod.app;
export const squareApp = isDevelopment ? service.square.sandbox.app : service.square.production.app;
export const squareEnvironment = isDevelopment ? Environment.Sandbox : Environment.Production;
export const squareToken = isDevelopment ? service.square.sandbox.token : service.square.production.token;
export const thesaurusKey = service.thesaurus;
