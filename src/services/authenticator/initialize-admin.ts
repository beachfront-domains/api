


//  I M P O R T

import { r } from "rethinkdb-ts";

//  U T I L S

import { databaseOptions, log } from "~util/index";
import { UserDefaults } from "~module/user/schema";

const AdminDefaults = {
  company: "Ideas Never Cease",
  email: "paul@webb.page",
  login: "NetOpWibby",
  name: "netop://ウエハ",
  role: "Admin"
};



//  E X P O R T

export default async() => {
  const databaseConnection = await r.connect(databaseOptions);

  const adminQuery = await r.table("users").filter({ role: "Admin" })
    .run(databaseConnection);

  try {
    const queryResult = adminQuery[0];

    switch(true) {
      case queryResult === undefined:
        try {
          await r.table("users").insert({ ...UserDefaults, ...AdminDefaults })
            .run(databaseConnection);
          log.info("Created admin user");
        } catch(insertError) {
          log.error("Unable to create admin user");
        }

        break;

      case queryResult !== undefined:
        log.info("Admin user exists");
        break;

      default:
        log.error("Something went wrong querying for admin user");
        break;
    }
  } catch(error) {
    log.error("Unable to query for admin user");
  }

  databaseConnection.close();
};



// ⌘ Data Explorer
// r.db("beachfront").table("users").filter({ role: "Admin" })
