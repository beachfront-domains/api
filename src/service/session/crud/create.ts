


///  I M P O R T

import { r } from "rethinkdb-ts";
// import validateEmail from "@webb/validate-email";

///  U T I L

import { databaseOptions, errorLogger } from "~util/index";
import { get } from "./read";
import type { LooseObject } from "~util/index";
import type { SessionCreate } from "~schema/index";

const databaseName = "session";
const emptyResponse = { detail: { id: "" }};



///  E X P O R T

export default async(input: SessionCreate) => {
  const databaseConnection = await r.connect(databaseOptions);
  const { options } = input;
  const query: LooseObject = {};

  Object.entries(options).forEach(([key, value]) => {
    switch(key) {
      case "customer":
      case "id":
        query[key] = String(value);
        break;

      case "cart":
        query[key] = value;
        break;

      default:
        break;
    }
  });

  if (query.id) {
    const doesDocumentExist = await get({ options: { id: query.id }});

    if (Object.keys(doesDocumentExist.detail).length !== 0) {
      databaseConnection.close();
      return doesDocumentExist; /// document exists, return it
    }

    /// if document does not exist, delete `id` key
    delete query.id;
  }

  try {
    const createDocument = await r
      .table(databaseName)
      .insert({
        ...query,
        created: new Date(),
        updated: new Date()
      })
      .run(databaseConnection);

    if (createDocument.inserted !== 1) {
      databaseConnection.close();
      errorLogger(query, "Error creating session.");
      return emptyResponse;
    }

    let createdDocument = await r.table(databaseName)
      .filter({ id: createDocument!.generated_keys![0] })
      .run(databaseConnection);

    createdDocument = createdDocument[0];
    databaseConnection.close();

    return { detail: createdDocument };
  } catch(error) {
    databaseConnection.close();
    errorLogger(error, "Exception caught while creating session.");
    return emptyResponse;
  }
};
