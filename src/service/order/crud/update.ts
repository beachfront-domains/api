


///  I M P O R T

import { r } from "rethinkdb-ts";
import type { WriteResult } from "rethinkdb-ts";

///  U T I L

import { databaseOptions, objectCompare } from "~util/index";
import { get } from "./read";
import type { OrderUpdate } from "~schema/index";
import type { LooseObject } from "~util/index";

const databaseName = "order";



///  E X P O R T

export default async(suppliedData: OrderUpdate) => {
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
      case "payment":
        query[key] = String(value).trim();
        break;

      case "success":
        query[key] = Boolean(value);
        break;

      default:
        break;
    }
  });

  const documentExistenceQuery = await get({ options });

  if (documentExistenceQuery.detail.id.length === 0) {
    databaseConnection.close();
    /// order does not exist, return blank
    return { detail: { id: "" }};
  }

  const documentToUpdate = documentExistenceQuery.detail;
  const diff = objectCompare(query, documentToUpdate); // new data compared to existing data
  const changedParameters = Object.keys(diff); // returns an array

  changedParameters.forEach((parameter: string) => {
    // dataSet[parameter] // dataPush[parameter] // dataPull[parameter]

    switch(parameter) {
      case "payment":
      case "success":
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

      console.group("Error updating order");
      console.error(updatedDocumentDetails);
      console.groupEnd();

      return { detail: { id: "" }};
    }

    const updatedDocument: WriteResult = documentUpdate?.changes && documentUpdate.changes[0].new_val;
    databaseConnection.close();

    return { detail: updatedDocument };
  } catch(error) {
    databaseConnection.close();

    console.group("Exception caught while updating order");
    console.error(error);
    console.groupEnd();

    return { detail: { id: "" }};
  }
}
