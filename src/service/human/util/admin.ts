


///  I M P O R T

import { r } from "rethinkdb-ts";

///  U T I L

import { databaseOptions, printError, printSuccess } from "~util/index";
import { CustomerDefaults } from "~module/customer/default";

const AdminDefaults = {
  bio: "Super cool admin of beachfront",
  email: "paul@webb.page",
  homepage: "https://webb.page",
  location: "Carina Nebula",
  name: "The Most Fantabulous",
  role: "admin",
  username: "NetOpWibby",
  verified: true
};

const customerDatabase = "customers";



///  E X P O R T

export default async() => {
  const databaseConnection = await r.connect(databaseOptions);

  const adminQuery = await r.table(customerDatabase)
    .filter({ role: "admin" })
    .run(databaseConnection);

  try {
    const queryResult = adminQuery[0];

    if (queryResult) {
      databaseConnection.close();
      printSuccess("admin exists");

      return {
        httpCode: 201,
        message: "Admin exists",
        success: true,
        customer: queryResult
      };
    }

    const adminSubmission = await r.table(customerDatabase)
      .insert({
        ...CustomerDefaults,
        ...AdminDefaults,
        created: new Date(),
        updated: new Date()
      })
      .run(databaseConnection);

    if (adminSubmission.inserted !== 1) {
      databaseConnection.close();
      printError("admin creation failed");

      return {
        httpCode: 500,
        message: "Admin creation unsuccessful",
        success: false
      };
    }

    let adminQueryII = await r.table(customerDatabase)
      // @ts-ignore TS2532: Object is possibly "undefined".
      .filter({ id: adminSubmission.generated_keys[0] })
      .run(databaseConnection);

    adminQueryII = adminQueryII[0];
    databaseConnection.close();
    printSuccess("admin created");

    return {
      httpCode: 201,
      message: "Admin created",
      success: true,
      customer: adminQueryII
    };
  } catch(error) {
    databaseConnection.close();
    printError("admin query failed");
  }
};



// ⌘ Data Explorer
// r.db("beachfront").table("customers").filter({ role: "admin" })
