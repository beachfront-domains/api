


///  I M P O R T

import { r } from "rethinkdb-ts";

///  U T I L

import { databaseOptions, errorLogger } from "~util/index";
import { get as getSession } from "./read";
import type { LooseObject } from "~util/index";
import type { SessionRequest } from "~schema/index";

const databaseName = "session";



///  E X P O R T

export default async(input: SessionRequest) => {
  const databaseConnection = await r.connect(databaseOptions);
  const { options } = input;
  const query: LooseObject = {};

  // TODO
  // : ensure that customer does not own any domains before deletion
  // : return false/abort otherwise

  Object.entries(options).forEach(([key, value]) => {
    switch(key) {
      case "id":
        query[key] = String(value);
        break;

      default:
        break;
    }
  });

  const doesDocumentExist = await getSession({ options: { id: query.id }});

  if (Object.keys(doesDocumentExist.detail).length === 0) {
    databaseConnection.close();
    /// document does not exist so technically, the desired result is true
    return { success: true };
  }

  /// document exists, so grab ID to locate for deletion
  const documentId = doesDocumentExist?.detail?.id;

  try {
    const deleteDocument = await r
      .table(databaseName)
      .get(documentId)
      .delete({ returnChanges: true })
      .run(databaseConnection);

    if (deleteDocument.errors !== 0) {
      databaseConnection.close();
      errorLogger(query, "Session deletion failed.");
      return { success: false };
    }

    databaseConnection.close();
    return { success: true };
  } catch(error) {
    databaseConnection.close();
    errorLogger(error, "Exception caught while deleting session.");
    return { success: false };
  }
}
