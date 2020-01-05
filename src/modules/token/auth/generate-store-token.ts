"use strict";



//  I M P O R T S

import bcrypt from "bcrypt";
import { r } from "rethinkdb-ts";

//  U T I L S

import {
  databaseOptions,
  generateGuid,
  generateToken,
  log
} from "~util/index";



//  E X P O R T

export default async(userEmail: string, options?: object) => { // Create and store token
  const databaseConnection = await r.connect(databaseOptions);
  const guid = generateGuid();
  const token = generateToken(guid, options);

  // Remove special characters to better support email links
  const hash = bcrypt.hashSync(token, 5).replace(/([$|/])/g, "")
    .slice(0, 11);

  // Delete all existing tokens of this user
  await r.table("tokens").filter({ uid: userEmail })
    .delete()
    .run(databaseConnection);

  try {
    const TokenObject = {
      created: new Date(),
      hash: hash,
      token: token,
      ttl: new Date(+new Date() + 864e5), // 24 hours | e5 = 00000
      uid: userEmail,
      updated: new Date()
    };

    // Create new token
    await r.table("tokens").insert(TokenObject)
      .run(databaseConnection);
  } catch(tokenQueryError) {
    databaseConnection.close();
    const errorMessage = "Token creation failed";

    log.error(errorMessage);
    return JSON.stringify({ message: errorMessage });
  }

  databaseConnection.close();
  return hash;
};
