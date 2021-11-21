


///  I M P O R T

import { r } from "rethinkdb-ts";
import { toASCII } from "tr46";

///  U T I L

import { databaseOptions } from "~util/index";
import { get } from "./read";
import { getExtension } from "~service/extension/index";
import type { DomainCreate } from "~schema/index";
import type { LooseObject } from "~util/index";

const databaseName = "domain";



///  E X P O R T

export default async(suppliedData: DomainCreate) => {
  const databaseConnection = await r.connect(databaseOptions);
  const { options } = suppliedData;
  const query: LooseObject = {};

  Object.entries(options).forEach(([key, value]) => {
    switch(key) {
      case "ascii":
      case "expiry":
      case "extension":
      case "name":
      case "status":
        query[key] = String(value);
        break;

      case "owner":
        query[key] = value;
        break;

      default:
        break;
    }
  });

  if (!options.ascii)
    query.ascii = toASCII(options.name, { processingOption: "transitional" });

  const doesExtensionExist = await getExtension({ options: { id: query.extension }});

  if (doesExtensionExist.detail.id.length === 0) {
    databaseConnection.close();

    console.group("Error creating domain, extension does not exist.");
    console.error(query);
    console.groupEnd();

    return { detail: { id: "" }};
  }

  const doesDocumentExist = await get({ options: { ...query }});

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

      console.group("Error creating domain");
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

    console.group("Exception caught while creating domain");
    console.error(error);
    console.groupEnd();

    return { detail: { id: "" }};
  }
}
