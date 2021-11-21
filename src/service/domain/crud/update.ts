


///  I M P O R T

import { r } from "rethinkdb-ts";
import type { WriteResult } from "rethinkdb-ts";

///  U T I L

import { databaseOptions, objectCompare } from "~util/index";
import { get } from "./read";
import type { DomainUpdate } from "~schema/index";
import type { LooseObject } from "~util/index";

const databaseName = "domain";



///  E X P O R T

export default async(suppliedData: DomainUpdate) => {
  const { changes, options } = suppliedData;

  if (!changes || !options)
    return { detail: { id: "" }};

  const databaseConnection = await r.connect(databaseOptions);
  const query: LooseObject = {};

  const dataPull = {}; /// for arrays
  const dataPush = {}; /// also for arrays
  const dataSet = {};

  Object.entries(changes).forEach(([key, value]) => {
    switch(key) {
      case "expiry":
        query[key] = String(value).trim();
        break;

      case "owner":
        query[key] = value;
        break;

      default:
        break;
    }
  });

  const documentExistenceQuery = await get({ options });

  if (documentExistenceQuery.detail.id.length === 0) {
    databaseConnection.close();
    /// extension does not exist, return blank
    return { detail: { id: "" }};
  }

  const documentToUpdate = documentExistenceQuery.detail;
  const diff = objectCompare(query, documentToUpdate); // new data compared to existing data
  const changedParameters = Object.keys(diff); // returns an array

  changedParameters.forEach((parameter: string) => {
    // dataSet[parameter] // dataPush[parameter] // dataPull[parameter]

    // TODO
    // : flesh out "owner" parameter

    switch(parameter) {
      case "expiry":
      case "owner":
        dataSet[parameter] = changes[parameter];
        break;

      default:
        break;
    }
  });

  await dataSet;
  await dataPull;
  await dataPush;

  const updatedDocumentDetails: LooseObject = {
    ...dataSet,
    ...dataPull,
    ...dataPush,
    updated: new Date()
  };

  try {
    const documentUpdate = await r
      .table(databaseName)
      .get(documentToUpdate.id)
      .update(updatedDocumentDetails, {
        returnChanges: true
      })
      .run(databaseConnection);

    if (documentUpdate.errors > 0) {
      databaseConnection.close();

      console.group("Error updating domain");
      console.error(updatedDocumentDetails);
      console.groupEnd();

      return { detail: { id: "" }};
    }

    const updatedDocument: WriteResult = documentUpdate?.changes && documentUpdate.changes[0].new_val;
    databaseConnection.close();

    return { detail: updatedDocument };
  } catch(error) {
    databaseConnection.close();

    console.group("Exception caught while updating domain");
    console.error(error);
    console.groupEnd();

    return { detail: { id: "" }};
  }
}
