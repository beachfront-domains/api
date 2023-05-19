


/// import

import { GraphQLHTTP } from "dep/x/alpha.ts";
import { makeExecutableSchema } from "dep/x/graphql-tools.ts";
import { Server } from "dep/std.ts";

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

   __                __   ___              __
  / /  ___ ___ _____/ /  / _/______  ___  / /_
 / _ \\/ -_) _ \`/ __/ _ \\/ _/ __/ _ \\/ _ \\/ __/
/_.__/\\__/\\_,_/\\__/_//_/_//_/  \\___/_//_\\__/\n,

                   __
                  / / ${shellGreen(packageVersion)}
   ___  ___  ___ / /_______ __
  / _ \\/ _ \`(_-</ __/ __/ // /
 / .__/\\_,_/___/\\__/_/  \\_, /
/_/             SERVER /___/\n`,
  `\n${shellMagenta(`[✦] [API] ${shellUnderline(`::1:${port}`)}`)}\n`
);



/// helper

async function getVersion() {
  let version = "";

  try {
    version = await Deno.readTextFileSync("./version.txt");
  } catch(_) {
    // ignore
  }

  return version;
}
