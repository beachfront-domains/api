


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

const tokenDatabase = "tokens";



///  E X P O R T

export default async(customerEmail: string, options: {} = {}): Promise<string> => { // Create and store token
  if (!customerEmail)
    return "";

  const databaseConnection = await r.connect(databaseOptions);
  const guid = generateGuid();
  const token = generateToken(guid, options);

  // Remove special characters to better support email links
  const hash = bcrypt.hashSync(token, 5)
    .replace(/([$|/])/g, "")
    .slice(0, 11);

  // Delete all existing tokens of this customer
  await r.table(tokenDatabase)
    .filter({ uid: customerEmail })
    .delete()
    .run(databaseConnection);

  try {
    const newToken = {
      created: new Date(),
      hash,
      token,
      ttl: new Date(+new Date() + 864e5), // 24 hours | e5 = 00000
      uid: customerEmail,
      updated: new Date()
    };

    // Create new token
    await r.table(tokenDatabase)
      .insert(newToken)
      .run(databaseConnection);
  } catch(tokenQueryError) {
    databaseConnection.close();
    printError("Token creation failed");
    return "";
  }

  databaseConnection.close();
  return hash;
};
