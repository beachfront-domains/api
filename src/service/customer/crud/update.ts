


///  I M P O R T

import { r } from "rethinkdb-ts";
import type { WriteResult } from "rethinkdb-ts";

///  U T I L

import { databaseOptions, errorLogger, objectCompare } from "~util/index";
import { get } from "./read";
import type { CustomerUpdate } from "~schema/index";
import type { LooseObject } from "~util/index";

const databaseName = "customer";
const emptyResponse = { detail: { id: "" }};



///  E X P O R T

export default async(suppliedData: CustomerUpdate) => {
  const { changes, options } = suppliedData;

  if (!changes || !options)
    return emptyResponse;

  const databaseConnection = await r.connect(databaseOptions);
  const query: LooseObject = {};

  const dataPull = {}; /// for arrays
  const dataPush = {}; /// also for arrays
  const dataSet = {};

  Object.entries(changes).forEach(([key, value]) => {
    switch(key) {
      // case "email":
      // case "loginMethod":
      // case "name":
      // case "role":
      // case "timezone":
      // case "username":
      //   query[key] = String(value);
      //   break;

      case "cart":
        query[key] = value;
        break;

      default:
        break;
    }
  });

  // if (changes.email) {
  //   const claimedEmailQuery = await get({ options: { email: changes.email }});

  //   /// email is taken
  //   if (Object.keys(claimedEmailQuery).length > 0) {
  //     databaseConnection.close();

  //     console.group("Email is in use");
  //     console.error(changes.email);
  //     console.groupEnd();

  //     return { detail: {}};
  //   }
  // }

  // if (changes.username) {
  //   const claimedUsernameQuery = await get({ options: { username: changes.username }});

  //   /// username is taken
  //   if (Object.keys(claimedUsernameQuery).length > 0) {
  //     databaseConnection.close();

  //     console.group("Username is taken");
  //     console.error(changes.username);
  //     console.groupEnd();

  //     return { detail: {}};
  //   }

  //   /// Block non-admin customer from changing username to a restricted username
  //   /// If customer has an admin role, proceed.
  //   // if (originalCustomerData.role !== "admin" && invalidUsername.indexOf(changes.username) > 0) {
  //   //   databaseConnection.close();

  //   //   return {
  //   //     httpCode: 401,
  //   //     message: messageErrorUsernameNope,
  //   //     success: false
  //   //   };
  //   // }
  // }

  const documentExistenceQuery = await get({ options });

  if (Object.keys(documentExistenceQuery.detail).length === 0) {
    databaseConnection.close();
    /// document does not exist, return blank
    return emptyResponse;
  }

  const documentToUpdate = documentExistenceQuery.detail;
  const diff = objectCompare(query, documentToUpdate); // new data compared to existing data
  const changedParameters = Object.keys(diff); // returns an array

  changedParameters.forEach(parameter => {
    // dataSet[parameter] // dataPush[parameter] // dataPull[parameter]
    dataSet[parameter] = changes[parameter];
  });

  await dataSet;
  await dataPull;
  await dataPush;

  const finalObject = {
    ...dataSet,
    ...dataPull,
    ...dataPush,
    updated: new Date()
  };

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
      errorLogger(finalObject, "Error updating customer.");
      return emptyResponse;
    }

    const updatedDocument: WriteResult = documentUpdate?.changes && documentUpdate.changes[0].new_val;
    databaseConnection.close();

    return { detail: updatedDocument };
  } catch(error) {
    databaseConnection.close();
    errorLogger(error, "Exception caught while updating customer.");
    return emptyResponse;
  }
};
