


/// import

// import { default as createDNS } from "src/component/domain/utility/create-dns.ts";
import { cors } from "jsr:/@http/interceptor@0.14.0/cors";
import { intercept } from "jsr:/@http/interceptor@0.14.0/intercept";
import { STATUS_CODE } from "https://deno.land/std@0.224.0/http/status.ts";

import { GraphQLHTTP } from "dep/x/alpha.ts";
import { makeExecutableSchema } from "dep/x/graphql-tools.ts";

import {
  // Server,
  green as shellGreen,
  magenta as shellMagenta,
  underline as shellUnderline
} from "dep/std.ts";

import { dedent } from "dep/x/dedent.ts";

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

Deno.serve({
  handler: intercept(async(req) => {
    const { pathname } = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: STATUS_CODE.NoContent
      });
    }

    return pathname === "/graphql" ?
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
  }, cors({ allowOrigin: isDevelopment ? "*" : "https://beachfront.domains" })),
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
}) as Deno.HttpServer;



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
