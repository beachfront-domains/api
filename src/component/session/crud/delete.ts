


/// import

import { r } from "rethinkdb-ts";

/// util

import { databaseOptions, errorLogger } from "src/utility/index.ts";
import { get as getSession } from "./read.ts";
import type { LooseObject } from "src/utility/index.ts";
import type { SessionRequest } from "src/schema/index.ts";

const databaseName = "session";



/// export

export default async(input: SessionRequest) => {
  const databaseConnection = await r.connect(databaseOptions);
  const { options: { id }} = input;
  const query: LooseObject = {};

  // TODO
  // : ensure that customer does not own any domains before deletion
  // : return false/abort otherwise

  const doesDocumentExist = await getSession({ options: { id: String(id) }});

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
