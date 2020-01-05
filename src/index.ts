


//  I M P O R T S

import { bold } from "colorette";
import corsMiddleware from "restify-cors-middleware";
import env from "vne";
import restify from "restify";

//  U T I L S

import { initializeAdmin } from "~service/authenticator";

import {
  appName,
  appPort,
  appUrl,
  appVersion,
  ensureDatabase,
  ensureTable,
  environment,
  isDevelopment,
  log
} from "~util/index";

import prepareRoutes from "~route/index";

const cors = corsMiddleware({
  origins: [
    isDevelopment ?
      "*" :
      `https://*${env.site.url}`
  ],
  preflightMaxAge: 5
});

const server = restify.createServer({
  name: appName,
  version: appVersion
});

//  ~     E R R O R
//  H A N D L I N G
//  TODO: Make this better, if possible

// process.on("uncaughtException", (reason: any, origin: any) => {
//   // https://gist.github.com/a0viedo/0de3036c9d50efbf5e70bf218097dc68
//   // log.error("Uncaught Exception");
//   // log.error(origin);
//   // log.error(reason, { prettyPrint: true });
//   // console.log(origin);
//   // console.log(Object.keys(process).sort());
//   // console.log("");
//   // console.group("Uncaught Exception");
//   // console.log(JSON.stringify(origin, null, 2));
//   // console.log("");
//   console.group(origin);
//   console.log(JSON.stringify(reason, null, 2));
//   console.groupEnd();
//   // log.error(":::::::::::::::::::::::::::::::::::");

//   server.close(() => process.exit(1));
// });

// process.on("unhandledRejection", reason => {
//   log.error("Unhandled Rejection");
//   log.error(JSON.stringify(reason, null, 2));
//   log.error(":::::::::::::::::::::::::::::::::::");

//   server.close(() => process.exit(1));
// });



//  P R O G R A M

server.pre(cors.preflight);
server.pre(restify.pre.sanitizePath());

server.use(cors.actual);
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.authorizationParser());
server.use(restify.plugins.dateParser());
server.use(restify.plugins.queryParser({ mapParams: false }));
server.use(restify.plugins.jsonp());
server.use(restify.plugins.gzipResponse());
server.use(restify.plugins.bodyParser({ mapParams: true }));
server.use(restify.plugins.fullResponse());



//  I N I T

prepareRoutes(server);



//  B E G I N

server.listen(appPort, async() => {
  try {
    await ensureDatabase("beachfront");
    await ensureTable("passes", "pass");
    await ensureTable("tokens", "token");
    await ensureTable("domains", "owner");
    await ensureTable("users", ["email", "login"]);
    await initializeAdmin();
  } catch(databaseError) {
    log.error(databaseError);
  }

  log.info(`${bold(appName)} is running at ${bold(appUrl)} in mode ${bold(environment)}`);
});



// ⌘
// curl -XGET -H 'Content-Type:application/graphql' -d 'query { hello }' http://localhost:3000
// curl -XPOST -H 'Content-Type:application/graphql' -d 'query { user(id: "userID"){ email }}' http://localhost:3000
// curl -XPOST -H 'Content-Type:application/graphql' -d 'query { user(id: "5c68b0ed7fac6f9a9ecdeec3"){ email, name }}' http://localhost:3000
