


/// import

// import { default as createDNS } from "src/component/domain/utility/create-dns.ts";
import { cors } from "jsr:/@http/interceptor@0.13.0/cors";
import { GraphQLHTTP } from "dep/x/alpha.ts";
import { makeExecutableSchema } from "dep/x/graphql-tools.ts";

import {
  // Server,
  green as shellGreen,
  magenta as shellMagenta,
  underline as shellUnderline
} from "dep/std.ts";

import { dedent } from "dep/x/dedent.ts";

// import cors from "https://deno.land/x/edge_cors/src/cors.ts"; // v0.2.1

/// util

import { checklist } from "src/utility/index.ts";
import { Mutation, Query } from "src/schema/resolver.ts";
import theSchema from "src/schema/index.ts";

const isDevelopment = Deno.args.includes("development");

const schema = makeExecutableSchema({
  resolvers: { Query, Mutation },
  // @ts-ignore | TS2322 [ERROR]: Type "DocumentNode | Record<string, unknown>" is not assignable to type "TypeSource".
  typeDefs: theSchema
  // https://github.com/ardatan/graphql-tools/blob/a6aced62dbbec02a01450aafd9c00bdd8eb8f0ce/packages/utils/src/Interfaces.ts#L257
});



/// program

// await createDNS("test12.lynk");

const meta = await getVersion();
const packageVersion = meta.trim();
const { port } = await checklist();

// const server = Deno.serve({ port: port() },
//   intercept(
//     () => new Response("Hello"),
//     cors(),
//   ),
// ) as Deno.HttpServer;

Deno.serve({
  handler: async(req) => {
    // if (req.method == "OPTIONS") {
    //   const resp = new Response(null, { status: 204 });
    //   const origin = req.headers.get("Origin") || "*";
    //   const headers = resp.headers;

    //   headers.set("Access-Control-Allow-Origin", origin);
    //   headers.set("Access-Control-Allow-Methods", "*");

    //   return resp;
    // }

    // console.log(req.headers);
    // console.log("—");
    // const origin = req.headers.get("Origin") || "*";
    // const resp = await ctx.next();
    // const headers = resp.headers;

    // headers.set("Access-Control-Allow-Origin", origin);
    // headers.set("Access-Control-Allow-Credentials", "true");

    // headers.set(
    //   "Access-Control-Allow-Headers",
    //   "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With"
    // );

    // headers.set(
    //   "Access-Control-Allow-Methods",
    //   "POST, OPTIONS, GET, PUT, DELETE"
    // );

    const { pathname } = new URL(req.url);

    return pathname === "/graphql" ?
      // cors(req, await GraphQLHTTP<Request>({
      //   context: request => ({
      //     request,
      //     "x-session": new Headers(req.headers).get("authorization")
      //   }),
      //   graphiql: isDevelopment,
      //   schema
      // })(req)) :
      await GraphQLHTTP<Request>({
        context: request => ({
          request,
          "x-session": new Headers(req.headers).get("authorization")
        }),
        graphiql: true, // isDevelopment,
        schema
      })(req) :
      Response.json({
        detail: "Please visit our documentation for information on how to use the beachfront/ API.",
        status: 406,
        title: "Not Acceptable",
        url: "https://domains.beachfront/kb/developer"
      });
  },
  hostname: "0.0.0.0",
  onListen({ port }) {
    console.log(
      dedent`
     ┌${repeatCharacter("─", 32)}┐
     │ ${pad("BEACHFRONT API", 30)} │
     │ ${isDevelopment ? fit("→ development") : fit("→ production")} │
     │ ${shellGreen(fit(packageVersion))} │
     └${repeatCharacter("─", 32)}┘
      LOCAL ${shellMagenta(`${shellUnderline(`0.0.0.0:${port}`)}`)}
      `
    );
  },
  port
}, cors());



/// helper

async function getVersion() {
  let version = "";

  try {
    version = await Deno.readTextFile("./version.txt");
  } catch(_) {
    /// ignore
  }

  return version;
}

function fit(input: string) {
  // 34 - 4 (border + one space each side)
  const remainingSpace = 30 - input.length;
  return input + " ".repeat(remainingSpace);
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
