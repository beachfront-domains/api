


///  I M P O R T

import { r } from "rethinkdb-ts";

///  U T I L

import { databaseOptions, errorLogger } from "~util/index";
import { get } from "./read";
import type { LooseObject } from "~util/index";
import type { Session, SessionCreate } from "~schema/index";

const databaseName = "session";
const emptyResponse = { detail: { id: "" }};



///  E X P O R T

export default async(input: SessionCreate): Promise<{ detail: Session|LooseObject }> => {
  const databaseConnection = await r.connect(databaseOptions);
  const { options } = input;
  const query: LooseObject = {};

  Object.entries(options).forEach(([key, value]) => {
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

  if (!query.cart)
    query.cart = [];

  if (!query.customer)
    query.customer = null;

  /// NOTE
  /// We do not check the `customer` ID for validity, as this is
  /// supposed to be a quick and easy way to have a persistent
  /// cart. We do not care at this point in time.

  // TODO
  // : revisit above note...why have `customer` parameter
  // : if it is not being used?

  // TODO
  // : check customer key for validity? or perform check(s) at auth layer?

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
