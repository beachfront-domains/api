


// /// import

// import e from "dbschema";

// /// util

// import { client } from "src/utility/index.ts";



// /// export

// export async function accessControl(ctx) {
//   if (!ctx || !ctx["x-session"])
//     return false;

//   const bearerTokenParts = ctx["x-session"].split(" ");
//   let sessionToken = "";

//   if (bearerTokenParts.length === 2 && bearerTokenParts[0].toLowerCase() === "bearer")
//     sessionToken = String(bearerTokenParts[1]);
//   else
//     return false;

//   const doesDocumentExist = e.select(e.api.Key, document => ({
//     ...e.api.Key["*"],
//     filter_single: e.op(document.id, "=", e.uuid(sessionToken))
//   }));

//   const existenceResult = await doesDocumentExist.run(client);

//   // TODO
//   // : check `existenceResult.url` to compare/match with `ctx` host/origin/referer

//   if (!existenceResult)
//     return false; /// key is nonexistent

//   return true;
// }
