


///  I M P O R T

import { r } from "rethinkdb-ts";
import validateEmail from "@webb/validate-email";

///  U T I L

import { databaseOptions } from "~util/index";
import { get } from "./read";
import type { CustomerCreate } from "~schema/index";
import type { LooseObject } from "~util/index";

const databaseName = "customer";

const documentDefaults = {
  /// email
  /// id
  loginMethod: "link",
  name: "Anon Mous",
  role: "customer",
  staff: false,
  timezone: "GMT-06:00",
  /// username
  verified: false
};



///  E X P O R T

export default async(suppliedData: CustomerCreate) => {
  const databaseConnection = await r.connect(databaseOptions);
  const { options } = suppliedData;
  const query: LooseObject = {};

  Object.entries(options).forEach(([key, value]) => {
    switch(key) {
      case "email":
      case "loginMethod":
      case "name":
      case "role":
      case "timezone":
      case "username":
        query[key] = String(value);
        break;

      case "staff":
        query[key] = Boolean(value);
        break;

      default:
        break;
    }
  });

  if (!validateEmail(query.email))
    return { detail: {}};

  const email = String(query.email).toLowerCase();
  const doesDocumentExist = await get({ options: { email }});

  if (Object.keys(doesDocumentExist.detail).length !== 0) {
    databaseConnection.close();
    return doesDocumentExist; /// document exists, return it
  }

  if (!query.username)
    query.username = createUsername(email);

  try {
    const createDocument = await r
      .table(databaseName)
      .insert({
        ...documentDefaults,
        ...query,
        created: new Date(),
        updated: new Date()
      })
      .run(databaseConnection);

    if (createDocument.inserted !== 1) {
      databaseConnection.close();

      console.group("Error creating customer");
      console.error(query);
      console.groupEnd();

      return { detail: {}};
    }

    let createdDocument = await r.table(databaseName)
      .filter({ id: createDocument!.generated_keys![0] })
      .run(databaseConnection);

    createdDocument = createdDocument[0];
    databaseConnection.close();

    return { detail: createdDocument };
  } catch(error) {
    databaseConnection.close();

    console.group("Exception caught while creating customer");
    console.error(error);
    console.groupEnd();

    return { detail: {}};
  }
};



///  H E L P E R

function createUsername(suppliedEmail: string): string {
  return String(suppliedEmail)
    .split("@")[0]
    .replace(/\+/g, "") + String(Math.random())
    .split(".")[1]
    .slice(0, 5);
}
