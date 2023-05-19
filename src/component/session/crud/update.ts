


/// import

import dif from "microdiff";
import { diff as test, jsonPatchPathConverter } from "just-diff";
import { r } from "rethinkdb-ts";
import type { WriteResult } from "rethinkdb-ts";

/// util

import { databaseOptions, errorLogger, objectCompare } from "src/utility/index.ts";
import { get } from "./read.ts";
import type { LooseObject } from "src/utility/index.ts";
import type { SessionUpdate } from "src/schema/index.ts";

const databaseName = "session";
const emptyResponse = { detail: { id: "" }};



/// export

export default async(input: SessionUpdate) => {
  const { changes, options: { id }} = input;
  const databaseConnection = await r.connect(databaseOptions);
  const dataSet: LooseObject = {};
  const query: LooseObject = {};

  Object.entries(changes).forEach(([key, value]) => {
    switch(key) {
      case "cart":
        query[key] = [...new Set(value as any[])]; /// eliminate duplicates
        break;

      case "customer":
        query[key] = String(value);
        break;

      default:
        break;
    }
  });

  // TODO
  // : check customer key for validity? or perform check(s) at auth layer?

  const documentExistenceQuery = await get({ options: { id: String(id) }});

  if (Object.keys(documentExistenceQuery.detail).length === 0) {
    databaseConnection.close();
    /// document does not exist, return blank
    return emptyResponse;
  }

  const documentToUpdate = documentExistenceQuery.detail;

  if (!documentToUpdate.customer && query.customer) {
    /// We only update with the customer parameter if this session
    /// did not already have one. Case: someone adds domains to
    /// cart but is not logged in until later.
    dataSet.customer = query.customer;
  }

  dataSet.cart = query.cart;

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
