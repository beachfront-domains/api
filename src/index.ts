


///  I M P O R T

// import auth from "simple-hmac-auth-express";
import bodyparser from "body-parser";
import cors from "cors";
import ensureDatabase from "@webb/ensure-database";
import ensureTable from "@webb/ensure-table";
import * as gql from "graphql";
import polka from "polka";
import { print } from "@webb/console";
import send from "@polka/send-type";



///  U T I L

import { apiPort, databaseOptions, environment } from "~util/constant";
import { getCustomers } from "~service/customer";
import { getExtensions } from "~service/extension";
import { name, version } from "~root/package.json";
import resolvers from "~schema/resolver";
import schema from "~schema/index";

const { buildSchema, graphql } = gql;
const { json } = bodyparser;



///  B E G I N

const server = polka();

server
  // TODO
  // : test auth once integration with registrar is done
  // .auth({
  //   // Required
  //   secretForKey: (apiKey, callback) => callback(null, "secret"),
  //   onRejected: (error, request, response, next) => response.status(401).end("401"),
  //   onAccepted: (request, response) => console.log(`authenticated ${request.method} ${request.url}`)

  //   // Body-parser options. All optional.
  //   body: {
  //     json: { limit: "1mb", strict: false },
  //     text: { type: "application/octet-stream" },
  //     urlencoded: { extended: true, limit: "5mb" }
  //   }
  // })
  .use(json())
  // TODO
  // : update CORS to be more restrictive in production
  //   : https://xn--4v8h.pixels.wtf
  //   : https://app.beachfront
  //   : https://*.beachfront.network
  .use(cors({ origin: "*" }))
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
    const { query, variables } = req.body;

    // export interface GraphQLArgs {
    //   schema: GraphQLSchema;
    //   source: string | Source;
    //   rootValue?: unknown;
    //   contextValue?: unknown;
    //   variableValues?: Maybe<{ readonly [variable: string]: unknown }>;
    //   operationName?: Maybe<string>;
    //   fieldResolver?: Maybe<GraphQLFieldResolver<any, any>>;
    //   typeResolver?: Maybe<GraphQLTypeResolver<any, any>>;
    // }

    const data = await graphql({
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

async function preFlightChecks() {
  try {
    await ensureDatabase({ name: "beachfront", options: databaseOptions });

    await ensureTable({ name: "customer", index: ["email", "username"], options: databaseOptions });
    await ensureTable({ name: "domain", index: ["ascii", "extension", "name"], options: databaseOptions });
    await ensureTable({ name: "extension", index: ["ascii", "name"], options: databaseOptions });
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
