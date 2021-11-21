


///  I M P O R T

import { r } from "rethinkdb-ts";
import { toASCII } from "tr46";
import type { WriteResult } from "rethinkdb-ts";

///  U T I L

import { databaseOptions, objectCompare } from "~util/index";
import { get } from "./read";
import type { ExtensionUpdate } from "~schema/index";
import type { LooseObject } from "~util/index";

const databaseName = "extension";



///  E X P O R T

export default async(suppliedData: ExtensionUpdate) => {
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
      case "ascii":
      case "name":
        query[key] = String(value).trim();
        break;

      default:
        break;
    }
  });

  if (!changes.ascii && changes.name)
    query.ascii = toASCII(changes.name, { processingOption: "transitional" });

  const documentExistenceQuery = await get({ options });

  if (documentExistenceQuery.detail.id.length === 0) {
    databaseConnection.close();
    /// extension does not exist, return blank
    return { detail: { id: "" }};
  }

  const documentToUpdate = documentExistenceQuery.detail;
  const diff = objectCompare(query, documentToUpdate); // new data compared to existing data
  const changedParameters = Object.keys(diff); // returns an array

  // TODO
  // : what happens if eveything in an array is deleted?
  // : might need to do an Object.key().length comparison...

  changedParameters.forEach((parameter: string) => {
    // dataSet[parameter] // dataPush[parameter] // dataPull[parameter]

    switch(parameter) {
      case "ascii":
      case "name":
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

      console.group("Error updating extension");
      console.error(updatedDocumentDetails);
      console.groupEnd();

      return { detail: {}};
    }

    const updatedDocument: WriteResult = documentUpdate?.changes && documentUpdate.changes[0].new_val;
    databaseConnection.close();

    return { detail: updatedDocument };
  } catch(error) {
    databaseConnection.close();

    console.group("Exception caught while updating extension");
    console.error(error);
    console.groupEnd();

    return { detail: { id: "" }};
  }
}
