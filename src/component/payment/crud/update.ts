


/// import

import { r } from "rethinkdb-ts";

/// util

import { databaseName, emptyResponse } from "../utility/constant.ts";
import { databaseOptions, objectCompare } from "src/utility/index.ts";
import { get } from "./read.ts";

import type {
  Customer,
  PaymentMethod,
  PaymentMethodUpdate
} from "src/schema/index.ts";

import type { LooseObject } from "src/utility/index.ts";



/// export

export default async(data: PaymentMethodUpdate, context: Customer): Promise<{ detail: PaymentMethod }> => {
  if (!data.changes || !data.options)
    return emptyResponse;

  if (!context || !context.id)
    return emptyResponse;

  const databaseConnection = await r.connect(databaseOptions);
  const { changes, options } = data;
  const query: LooseObject = {};

  const dataPull = {}; /// for arrays
  const dataPush = {}; /// also for arrays
  const dataSet = {};

  Object.entries(changes).forEach(([key, value]) => {
    switch(key) {
      case "mask":
        query[key] = String(value);
        break;

      default:
        break;
    }
  });

  const documentExistenceQuery = await get({ options }, context);

  if (documentExistenceQuery.detail.id.length === 0) {
    databaseConnection.close();
    /// document does not exist, return blank
    return emptyResponse;
  }

  if (documentExistenceQuery.detail.customer !== context.id) {
    databaseConnection.close();
    /// Payment method does not belong to customer passed via `context`, return blank
    return emptyResponse;
  }

  const documentToUpdate = documentExistenceQuery.detail;
  const diff = objectCompare(query, documentToUpdate); // new data compared to existing data
  const changedParameters = Object.keys(diff); // returns an array

  changedParameters.forEach((parameter: string) => {
    // dataSet[parameter] // dataPush[parameter] // dataPull[parameter]

    switch(parameter) {
      case "mask":
        dataSet[parameter] = query[parameter];
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

      console.group("Error updating payment method");
      console.error(updatedDocumentDetails);
      console.groupEnd();

      return emptyResponse;
    }

    const updatedDocument: PaymentMethod = documentUpdate?.changes && documentUpdate.changes[0].new_val;
    databaseConnection.close();

    return { detail: updatedDocument };
  } catch(error) {
    databaseConnection.close();

    console.group("Exception caught while updating payment method");
    console.error(error);
    console.groupEnd();

    return emptyResponse;
  }
}
