


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



///  U T I L

import { apiPort, databaseOptions, environment } from "~util/index";
import { getCustomer, getCustomers } from "~service/customer";
import { getExtensions } from "~service/extension";
import { getSession } from "~service/session";
import { name, version } from "~root/package.json";
import resolvers from "~schema/resolver";
import schema from "~schema/index";

const { buildSchema, graphql } = gql;
const isDevelopment = environment === "development";
const { json } = bodyparser;
const { key } = env();



///  B E G I N

const server = polka();

server
  .use(json())
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
    const { headers } = req;
    const { /*operationName,*/ query, variables } = req.body;

    /// Auth check on every POST request
    const { name, type } = operationStats(query);
    const token = headers.authorization;
    let customerContext;

    if (type === "mutation" && !token) {
      switch(true) {
        case name && name.toLowerCase() === "login":
        case name && name.toLowerCase() === "verify":
          break;

        default:
          console.error("No token");
          return send(res, 200, {});
      }
    }

    // TODO
    // : create debug function

    // console.log(">>> query");
    // console.log(`${type}/${name}\n`);
    // console.log(">>> token");
    // console.log(`${token}\n`);

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

    if (token) {
      const cleanedToken = String(token).split(" ")[1].trim();
      const sessionId = atob(cleanedToken);

      // TODO
      // : add "expires" parameter to sessions
      // : add expiration check to this function

      const { detail: { customer }} = await getSession({ options: { id: sessionId }});
      const { detail } = await getCustomer({ options: { id: String(customer) }});

      if (customer && Object.keys(detail).length > 1)
        customerContext = detail;
    }

    const data = await graphql({
      contextValue: customerContext,
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
    print.dim("::: "),
    "⚡ ",
    print.bold(apiPort),
    print.dim(" | "),
    print.bold(name),
    print.dim(" | "),
    print.bold(environment),
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
    await ensureTable({ name: "payment", options: databaseOptions });
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



// https://developer.squareup.com/reference/square/customers-api/create-customer
// https://developer.squareup.com/explorer/square/customers-api/create-customer
// https://developer.squareup.com/reference/sdks/web/payments/card-payments

// https://github.com/square/square-nodejs-sdk/blob/master/README.md
// https://github.com/square/square-nodejs-sdk/blob/master/doc/models/create-customer-request.md
// https://github.com/square/connect-api-examples/tree/master/connect-examples/v2/node_orders-payments
// https://github.com/square/connect-api-examples/tree/master/connect-examples/v2/node_payment

// https://developers.opennode.com/docs/creating-a-charge
// https://developers.opennode.com/docs/charges-webhooks

// https://github.com/opennodedev/opennode-node
// https://github.com/opennodedev/opennode-node/blob/master/examples/example.js
