


/// import

import { GraphQLHTTP } from "dep/x/alpha.ts";
import { makeExecutableSchema } from "dep/x/graphql-tools.ts";

import {
  Server,
  green as shellGreen,
  magenta as shellMagenta,
  underline as shellUnderline
} from "dep/std.ts";

/// util

import { checklist } from "src/utility/index.ts";
import { Query, Mutation } from "src/schema/resolver.ts";
import theSchema from "src/schema/index.ts";

const isProduction = Deno.args.includes("--production");

const schema = makeExecutableSchema({
  resolvers: { Query, Mutation },
  typeDefs: theSchema()
});



/// program

const meta = await getVersion();
const packageVersion = meta.trim();
const { port } = await checklist();

const api = new Server({
  handler: async(req) => {
    const { pathname } = new URL(req.url);

    return pathname === "/graphql" ?
      await GraphQLHTTP<Request>({
        context: request => ({
          request,
          "x-session": new Headers(req.headers).get("authorization")
        }),
        graphiql: !isProduction,
        headers: {
          // TODO: access control?
          "Access-Control-Allow-Origin": "*"
        },
        schema
      })(req) :
      Response.json({
        detail: "Please visit our documentation for information on how to use the beachfront/ API.",
        status: 406,
        title: "Not Acceptable",
        url: "https://app.beachfront/help/developer"
      });
  },
  port
});

api.listenAndServe();

console.log(
  `
 ┌${repeatCharacter("─", 32)}┐
 │ ${pad("BEACHFRONT API", 30)} │
 │ ${shellGreen(pad(packageVersion, 30))} │
 └${repeatCharacter("─", 32)}┘
  LOCAL ${shellMagenta(`${shellUnderline(`::1:${port}`)}`)}
  `
);



/// helper

async function getVersion() {
  let version = "";

  try {
    version = await Deno.readTextFileSync("./version.txt");
  } catch(_) {
    /// ignore
  }

  return version;
}

function pad(input: string, paddingAmount: number): string {
  if (!paddingAmount || paddingAmount <= 0)
    return input;

  const paddingLeft = paddingAmount - input.length;
  const padding = " ".repeat(paddingLeft);

  return `${input}${padding}`;
}

function repeatCharacter(input: string, repeatAmount: number): string {
  if (!repeatAmount || repeatAmount <= 0)
    return input;

  return input.repeat(repeatAmount);
}
