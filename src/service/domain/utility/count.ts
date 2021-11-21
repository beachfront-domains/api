


///  I M P O R T

import { r } from "rethinkdb-ts";

///  U T I L

import { databaseOptions } from "~util/index";

const databaseName = "domain";



///  E X P O R T

export default async(): Promise<number> => {
  const databaseConnection = await r.connect(databaseOptions);
  const documentCountQuery = await r.table(databaseName).run(databaseConnection);

  let documentCount = 0;

  try {
    documentCount = documentCountQuery.length;
  } catch(error) {
    console.group("Error retrieving domain count");
    console.error(error);
    console.groupEnd();
  } finally {
    databaseConnection.close();
    return documentCount;
  }
};
