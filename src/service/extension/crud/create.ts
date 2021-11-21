


///  I M P O R T

import { r } from "rethinkdb-ts";
import { toASCII } from "tr46";

///  U T I L

import { databaseOptions } from "~util/index";
import { get } from "./read";
import type { ExtensionCreate } from "~schema/index";
import type { LooseObject } from "~util/index";

const databaseName = "extension";



///  E X P O R T

export default async(suppliedData: ExtensionCreate) => {
  const databaseConnection = await r.connect(databaseOptions);
  const { options } = suppliedData;
  const query: LooseObject = {};

  Object.entries(options).forEach(([key, value]) => {
    switch(key) {
      case "ascii":
      case "name":
        query[key] = String(value);
        break;

      default:
        break;
    }
  });

  if (!options.ascii)
    query.ascii = toASCII(options.name, { processingOption: "transitional" });

  const doesDocumentExist = await get({ options: { name: query.name }});

  if (doesDocumentExist.detail.id.length !== 0) {
    databaseConnection.close();
    return doesDocumentExist; /// document exists, return it
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

      console.group("Error creating extension");
      console.error(query);
      console.groupEnd();

      return { detail: { id: "" }};
    }

    let createdDocument = await r.table(databaseName)
      .filter({ id: createDocument!.generated_keys![0] })
      .run(databaseConnection);

    createdDocument = createdDocument[0];
    databaseConnection.close();

    return { detail: createdDocument };
  } catch(error) {
    databaseConnection.close();

    console.group("Exception caught while creating extension");
    console.error(error);
    console.groupEnd();

    return { detail: { id: "" }};
  }
}
