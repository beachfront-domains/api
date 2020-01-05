


//  I M P O R T

import { r } from "rethinkdb-ts";

//  U T I L S

import { databaseOptions, log } from "~util/index";



//  E X P O R T

export default async() => {
  const databaseConnection = await r.connect(databaseOptions);
  const userCountQuery = await r.table("users").run(databaseConnection);
  let userCount = 0;

  try {
    userCount = userCountQuery.length;
    databaseConnection.close();

    return userCount;
  } catch(error) {
    databaseConnection.close();

    log.info("Error retrieving user count");
    log.error(error);

    return userCount;
  }
};
