


// /// import

// import { log } from "dep/std.ts";
// import { toASCII } from "dep/x/tr46.ts";

// /// util

// import { accessControl, client, stringTrim } from "src/utility/index.ts";
// import e from "dbschema";

// import type { DomainRequest } from "../schema.ts";
// import type { LooseObject, StandardBooleanResponse } from "src/utility/index.ts";

// // const thisFilePath = "/src/component/customer/crud/delete.ts";
// const thisFilePath = import.meta.filename;



// /// export

// export default async(_root, args: DomainRequest, ctx, _info?): StandardBooleanResponse => {
//   if (!await accessControl(ctx))
//     return { success: false };

//   const { params } = args;
//   const query = ({} as LooseObject);

//   Object.entries(params).forEach(([key, value]) => {
//     switch(key) {
//       case "id": {
//         query[key] = stringTrim(value);
//         break;
//       }

//       case "name": {
//         query[key] = toASCII(String(value));
//         break;
//       }

//       default:
//         break;
//     }
//   });

//   const doesDocumentExist = e.select(e.Domain, domain => ({
//     filter_single: query.id ?
//       e.op(domain.id, "=", e.uuid(query.id)) :
//       e.op(domain.name, "=", query.name)
//   }));

//   const existenceResult = await doesDocumentExist.run(client);

//   if (!existenceResult) {
//     log.warn(`[${thisFilePath}]› Cannot delete nonexistent document.`);
//     return { success: true };
//   }

//   /// document exists, so grab ID to locate for deletion
//   const documentId = e.uuid(existenceResult.id);

//   try {
//     const deleteQuery = e.delete(e.Domain, domain => ({
//       filter_single: e.op(domain.id, "=", documentId)
//     }));

//     await deleteQuery.run(client);

//     return { success: true };
//   } catch(_) {
//     // TODO
//     // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
//     log.error(`[${thisFilePath}]› Exception caught while deleting document.`);
//     return { success: false };
//   }
// }
