


///  I M P O R T

import bodyparser from "body-parser";
import cors from "cors";
import ensureDatabase from "@webb/ensure-database";
import ensureTable from "@webb/ensure-table";
import env from "vne";
import * as gql from "graphql";
import polka from "polka";
import { print } from "@webb/console";
import send from "@polka/send-type";

// import auth from "simple-hmac-auth-express";
// import { nanoid } from "nanoid";
// import { RethinkDBStore } from "session-rethinkdb-ts";
// import session from "express-session";



///  U T I L

import { apiPort, databaseOptions, environment } from "~util/index";
import { getCustomers } from "~service/customer";
import { getExtensions } from "~service/extension";
import { name, version } from "~root/package.json";
import resolvers from "~schema/resolver";
import schema from "~schema/index";

const { buildSchema, graphql } = gql;
const isDevelopment = environment === "development";
const { json } = bodyparser;
const { key } = env();



///  B E G I N

const server = polka();

// const store = new RethinkDBStore({
//   // RethinkDB connection options.
//   connectOptions: databaseOptions,
//   flushInterval: 60000, // How long to wait before flushing data. Defaults to 1 minute.
//   sessionTimeout: 86400000, // How long a session ID is valid for. Defaults to 1 day.
//   table: "session" // RethinkDB table to store session info to. Defaults to "session".
// });

// TODO
// : create auth middleware
//   : active on POST method

// console.log(server.get("env"));

// if (!isDevelopment)
//   server.set("trust proxy", 1);

server
  .use(json())
  // TODO
  // : update CORS to be more restrictive in production
  //   : https://xn--4v8h.pixels.wtf
  //   : https://app.beachfront
  //   : https://*.beachfront.network
  .use(cors({ origin: "*" }))
  // .use(session({
  //   cookie: { secure: !isDevelopment },
  //   genid: () => nanoid(),
  //   resave: true,
  //   saveUninitialized: false,
  //   secret: key.secret,
  //   store
  // }))
  .get("*", (req: any, res: any) => {
    const data = {
      detail: "Please visit our documentation for information on how to use the beachfront/ API.",
      title: "Method Not Allowed",
      url: "https://app.beachfront/help/developer"
    };

    send(res, 405, data);
  })
  // @ts-ignore | TS2345
  .post("/", async(req: any, res: any) => {
    const { headers, session: sess } = req;
    const { operationName, query, variables } = req.body;

    // Auth check on every POST request
    const { name, type } = operationStats(query);
    const token = headers.authorization;

    if (type === "mutation" && !token) {
      console.error("No token");

      switch(true) {
        case name && name.toLowerCase() === "login":
        case name && name.toLowerCase() === "verify":
          break;

        default:
          return send(res, 200, {});
      }
    }

    console.log(">>> query");
    console.log(`${type}/${name}\n`);

    // console.log(">>> token");
    // console.log(token);

    // sess.cookie.test = "wtf man idk";
    // console.log(">>> session");
    // console.log(sess);
    // console.log("\n");
    // session.save(sess);

    // TODO
    // : perform auth checks here, preferably via a separate function
    // : return null for context if no customer is found (in other functions, not here)
    // : check JWT and get customer
    // : add customer to context

    // if (type === "mutation" && name !== "login")

    // const user = new Promise((resolve, reject) => {
    //   jwt.verify(token, getKey, options, (err, decoded) => {
    //     if(err) {
    //       return reject(err);
    //     }
    //     resolve(decoded.email);
    //   });
    // });

    // return { user };

    /// REFERENCE
    /// export interface GraphQLArgs {
    ///   schema: GraphQLSchema;
    ///   source: string | Source;
    ///   rootValue?: unknown;
    ///   contextValue?: unknown;
    ///   variableValues?: Maybe<{ readonly [variable: string]: unknown }>;
    ///   operationName?: Maybe<string>;
    ///   fieldResolver?: Maybe<GraphQLFieldResolver<any, any>>;
    ///   typeResolver?: Maybe<GraphQLTypeResolver<any, any>>;
    /// }

    const data = await graphql({
      contextValue: {}, /// adds customer to context
      rootValue: resolvers,
      schema: buildSchema(schema()),
      source: query,
      variableValues: variables
    });

    send(res, 200, data);
  });

preFlightChecks();



///  H E L P E R

function logPrompt() {
  return [
    "\n",
    `${print.gray(":::")} `,
    `${print.green("⚡")} `,
    `${print.bold(print.white(apiPort))} `,
    `${print.gray("|")} `,
    `${print.bold(print.white(name))} `,
    `${print.gray("|")} `,
    `${print.bold(print.white(environment))}`,
    "\n\n"
  ].join("");
}

function operationStats(input: string) {
  const queryRegex = /(query|mutation)\s\w*/g;
  const operation = input.match(queryRegex);
  let name: null|string = null;
  let type: null|string = null;

  if (!operation || !operation[0])
    return { name, type };

  const stats = String(operation).split(" ");

  name = stats[1];
  type = stats[0];

  return { name, type };
}

async function preFlightChecks() {
  try {
    await ensureDatabase({ name: "beachfront", options: databaseOptions });

    await ensureTable({ name: "customer", index: ["email", "username"], options: databaseOptions });
    await ensureTable({ name: "domain", index: ["ascii", "extension", "name"], options: databaseOptions });
    await ensureTable({ name: "extension", index: ["ascii", "name"], options: databaseOptions });
    await ensureTable({ name: "order", options: databaseOptions });
    await ensureTable({ name: "session", options: databaseOptions });

    const adminExists = await getCustomers({ options: { role: "admin" }});
    const extensionsExist = await getExtensions({});

    if (adminExists.detail.length === 0)
      throw new Error(`\nNo admin exists!\nUse Data Explorer to create an admin and restart this API.\n`);

    if (Object.keys(extensionsExist.detail).length < 1)
      console.warn(`\nREMINDER: ADD EXTENSIONS\n`);
  } catch(womp) {
    throw womp;
  } finally {
    server.listen(apiPort, process.stdout.write(logPrompt()));
  }
}
