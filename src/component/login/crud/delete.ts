


/// import

import { log } from "dep/std.ts";

/// util

import { accessControl, client, orOperation } from "src/utility/index.ts";
import e from "dbschema";

import type { LooseObject, StandardBooleanResponse } from "src/utility/index.ts";
import type { LoginRequest } from "../schema.ts";

// const thisFilePath = "/src/component/registrar/crud/delete.ts";
const thisFilePath = import.meta.filename;



/// export

export default async(_root, args: LoginRequest, ctx, _info?): StandardBooleanResponse => {
  if (!await accessControl(ctx)) ///!!
    return { success: false };

  const { params } = args;
  const query: LooseObject = {};

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "email":
      case "id": {
        query[key] = String(value);
        break;
      }

      default: {
        break;
      }
    }
  });

  const doesDocumentExist = e.select(e.Login, document => ({
    // TODO
    // : https://github.com/edgedb/edgedb-js/issues/347 : https://discord.com/channels/841451783728529451/1103366864937160846
    // filter_single: query.id ?
    //   e.op(login.id, "=", e.uuid(query.id)) :
    //   e.op(login.email, "=", query.email)
    filter_single: orOperation(
      e.op(document.id, "=", e.uuid(query.id)),
      e.op(document.for.email, "=", query.email)
    )
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (!existenceResult) {
    log.warning(`[${thisFilePath}]› Cannot delete nonexistent document.`);
    return { success: true };
  }

  try {
    const deleteQuery = e.delete(e.Login, document => ({
      // TODO
      // : why is `existenceResult` an array? check this assumption
      filter_single: e.op(document.id, "=", e.uuid(existenceResult[0].id))
    }));

    await deleteQuery.run(client);
    return { success: true };
  } catch(_) {
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while deleting document.`);
    return { success: false };
  }
}
