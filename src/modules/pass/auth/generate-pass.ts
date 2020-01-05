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

import { PassDefaults } from "../schema";



//  E X P O R T

export default async(userEmail: string, options?: any) => { // Create and store pass
  const databaseConnection = await r.connect(databaseOptions);

  if (typeof options !== "object")
    options = {};

  // Pass expires 1 week from now
  options.expires = 604800000;

  const guid = generateGuid();
  const pass = generateToken(guid, options);
  const hash = bcrypt.hashSync(pass, 5).replace(/([$|/])/g, "")
    .slice(0, 11);

  // Delete all existing passes for this user
  await r.table("passes").filter({ uid: userEmail })
    .delete()
    .run(databaseConnection);

  try {
    const PassObject = {
      hash: hash,
      pass: pass,
      uid: userEmail
    };

    // Create new pass
    await r.table("passes").insert({ ...PassDefaults, ...PassObject })
      .run(databaseConnection);
  } catch(passCreationError) {
    databaseConnection.close();
    const errorMessage = "Pass creation failed";

    log.error(errorMessage);
    return JSON.stringify({ message: errorMessage });
  }

  databaseConnection.close();
  return hash;
};
