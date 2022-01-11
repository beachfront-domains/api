


///  I M P O R T

import { r } from "rethinkdb-ts";
import { toASCII } from "tr46";

///  U T I L

import count from "../utility/count";
import { databaseOptions } from "~util/index";
import { get } from "./read";
import type { OrderCreate } from "~schema/index";
import type { LooseObject } from "~util/index";

const databaseName = "order";



///  E X P O R T

export default async(suppliedData: OrderCreate) => {
  const databaseConnection = await r.connect(databaseOptions);
  const { options } = suppliedData;
  const query: LooseObject = {};

  Object.entries(options).forEach(([key, value]) => {
    switch(key) {
      case "customer":
      case "payment":
      case "promo":
      case "type":
        query[key] = String(value);
        break;

      case "success":
        query[key] = Boolean(value);
        break;

      case "amount":
      case "contents":
        query[key] = value;
        break;

      default:
        break;
    }
  });

  // const doesDocumentExist = await get({ options: { ...query }});

  // if (doesDocumentExist.detail.id.length !== 0) {
  //   databaseConnection.close();
  //   return doesDocumentExist; /// document exists, return it
  // }

  const id = await count() + 1; // TODO: make sure this works

  try {
    const createDocument = await r
      .table(databaseName)
      .insert({
        ...query,
        id,
        created: new Date(),
        updated: new Date()
      })
      .run(databaseConnection);

    if (createDocument.inserted !== 1) {
      databaseConnection.close();

      console.group("Error creating order");
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

    console.group("Exception caught while creating order");
    console.error(error);
    console.groupEnd();

    return { detail: { id: "" }};
  }
}
