


//  I M P O R T

import { r } from "rethinkdb-ts";

//  U T I L S

import { databaseOptions, log } from "~util/index";
// import { UserType } from "~module/user/types";



//  E X P O R T S

export async function getUser(suppliedData: object): Promise<any> {
  const databaseConnection = await r.connect(databaseOptions);
  const query = {};

  Object.entries(suppliedData).forEach(([key, value]) => {
    if (typeof value !== "string") // TODO: Deal with objects and other data types better
      value = String(value);

    (query as any)[key] = value;
  });

  // let response = await r.table("users").filter(query)
  //   .run(databaseConnection);

  try {
    let response = await r.table("users")
      .filter((user: any) => {
        if ((query as any).login)
          return user("login").match(`(?i)^${(query as any).login}$`);

        return query;
      })
      .run(databaseConnection);

    response = response[0];
    databaseConnection.close();

    if (!response) {
      return {
        id: null
      };
    }

    return response;
  } catch(error) {
    databaseConnection.close();
    log.info("Error retrieving user");
    log.error(error);

    return {
      id: null
    };
  }
}

export async function getUsers(suppliedData: object) {
  const databaseConnection = await r.connect(databaseOptions);

  try {
    const response = await r.table("users").filter(suppliedData)
      .run(databaseConnection);

    databaseConnection.close();
    return response;
  } catch(error) {
    databaseConnection.close();
    log.info("Error retrieving users");
    log.error(error);

    return null;
  }
}
