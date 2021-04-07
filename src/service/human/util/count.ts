


///  I M P O R T

import { r } from "rethinkdb-ts";

///  U T I L

import { databaseOptions, printError } from "~util/index";



///  E X P O R T

export default async(): Promise<number> => {
  const databaseConnection = await r.connect(databaseOptions);
  const customerCountQuery = await r.table("customers").run(databaseConnection);
  // TODO
  // : check for *verified* customers
  let customerCount = 0;

  try {
    customerCount = customerCountQuery.length;
  } catch(error) {
    printError("Error retrieving customer count");
  } finally {
    databaseConnection.close();
    return customerCount;
  }
};
