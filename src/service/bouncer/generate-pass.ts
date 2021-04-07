


///  I M P O R T

import bcrypt from "bcrypt";
import { r } from "rethinkdb-ts";

///  U T I L

import {
  databaseOptions,
  generateGuid,
  generateToken,
  printError
} from "~util/index";

const passDatabase = "passes";



///  E X P O R T

export default async(customerEmail: string, options: { expires?: number } = {}): Promise<string> => {
  const databaseConnection = await r.connect(databaseOptions);

  /// Pass expires 1 week from now
  options.expires = 6.04e+8; /// week in seconds

  const guid = generateGuid();
  // @ts-ignore
  const pass = generateToken(guid, options);
  const hash = bcrypt.hashSync(pass, 5)
    .replace(/([$|/])/g, "")
    .slice(0, 11);

  /// Delete all existing passes for this customer
  await r.table(passDatabase)
    .filter({ uid: customerEmail })
    .delete()
    .run(databaseConnection);

  try {
    const data = {
      hash,
      pass,
      uid: customerEmail
    };

    /// Create new pass
    await r.table(passDatabase)
      .insert({ ...data })
      .run(databaseConnection);
  } catch(passCreationError) {
    databaseConnection.close();
    printError("Pass creation failed");
    return "";
  }

  databaseConnection.close();
  return hash;
};
