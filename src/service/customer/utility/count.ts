


///  I M P O R T

import { r } from "rethinkdb-ts";

///  U T I L

import { databaseOptions, errorLogger } from "~util/index";

const databaseName = "customer";



///  E X P O R T

export default async(): Promise<number> => {
  const databaseConnection = await r.connect(databaseOptions);
  const documentCountQuery = await r.table(databaseName).run(databaseConnection);
  // TODO
  // : check for *verified* customers
  let documentCount = 0;

  try {
    documentCount = documentCountQuery.length;
  } catch(error) {
    errorLogger(error, "Error retrieving customer count.");
  } finally {
    databaseConnection.close();
    return documentCount;
  }
};
