


///  I M P O R T

import dif from "microdiff";
import { diff as test, jsonPatchPathConverter } from "just-diff";
import { r } from "rethinkdb-ts";
import type { WriteResult } from "rethinkdb-ts";

///  U T I L

import { databaseOptions, errorLogger, objectCompare } from "~util/index";
import { get } from "./read";
import type { LooseObject } from "~util/index";
import type { SessionUpdate } from "~schema/index";

const databaseName = "session";
const emptyResponse = { detail: { id: "" }};



///  E X P O R T

export default async(input: SessionUpdate) => {
  const { changes, options } = input;

  if (!changes || !options)
    return emptyResponse;

  const databaseConnection = await r.connect(databaseOptions);
  const dataSet: LooseObject = {};
  const locateQuery: LooseObject = {};
  const query: LooseObject = {};

  Object.entries(changes).forEach(([key, value]) => {
    switch(key) {
      case "cart":
        // query[key] = [...new Set(value)]; // TODO: focus on `name` to better eliminate duplicates
        query[key] = value; // TS2769: No overload matches this call.
        break;

      default:
        break;
    }
  });

  Object.entries(options).forEach(([key, value]) => {
    switch(key) {
      case "id":
        locateQuery[key] = String(value);
        break;

      default:
        break;
    }
  });

  const documentExistenceQuery = await get({ options: { id: locateQuery.id }});

  if (Object.keys(documentExistenceQuery.detail).length === 0) {
    databaseConnection.close();
    /// document does not exist, return blank
    return emptyResponse;
  }

  const documentToUpdate = documentExistenceQuery.detail;
  dataSet.cart = query.cart; // all we care about is the cart

  const finalObject = {
    ...dataSet,
    updated: new Date()
  };

  // console.log(finalObject);
  // console.log(">>> finalObject");

  try {
    const documentUpdate = await r
      .table(databaseName)
      .get(documentToUpdate.id)
      .update(finalObject, {
        returnChanges: true
      })
      .run(databaseConnection);

    if (documentUpdate.errors > 0) {
      databaseConnection.close();
      errorLogger(finalObject, "Error updating session.");
      return emptyResponse;
    }

    const updatedDocument: WriteResult = documentUpdate?.changes && documentUpdate.changes[0].new_val;
    databaseConnection.close();

    return { detail: updatedDocument };
  } catch(error) {
    databaseConnection.close();
    errorLogger(error, "Exception caught while updating session.");
    return emptyResponse;
  }
};
