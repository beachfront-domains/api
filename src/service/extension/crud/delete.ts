


///  I M P O R T

import { r } from "rethinkdb-ts";

///  U T I L

import { databaseOptions } from "~util/index";
import { get as getExtension } from "./read";
import { getDomains } from "~service/domain/index";
import type { ExtensionRequest } from "~schema/index";
import type { LooseObject } from "~util/index";

const databaseName = "extension";



///  E X P O R T

export default async(suppliedData: ExtensionRequest) => {
  const databaseConnection = await r.connect(databaseOptions);
  const { options } = suppliedData;
  const query: LooseObject = {};

  Object.entries(options).forEach(([key, value]) => {
    switch(key) {
      case "ascii":
      case "id":
      case "name":
        query[key] = String(value);
        break;

      default:
        break;
    }
  });

  const doesDocumentExist = await getExtension({ options: { ...query }});

  if (doesDocumentExist.detail.id.length === 0) {
    databaseConnection.close();
    /// document does not exist so technically, the desired result is true
    return { success: true };
  }

  /// document exists, so grab ID to locate for deletion
  const documentId = doesDocumentExist.detail.id;
  const doDomainsExist = await getDomains({ options: { extension: documentId }});

  // TODO
  // : check below function once multiple documents get tested

  if (Object.keys(doDomainsExist.detail).length > 0) {
    databaseConnection.close();

    console.group("Error deleting extension, at least one domain exists.");
    console.error(`Domains: ${Object.keys(doDomainsExist.detail).length}`);
    console.groupEnd();

    return { success: false };
  }

  try {
    const deleteDocument = await r
      .table(databaseName)
      .get(documentId)
      .delete({ returnChanges: true })
      .run(databaseConnection);

    if (deleteDocument.errors !== 0) {
      databaseConnection.close();

      console.group("Extension deletion failed");
      console.error(query);
      console.groupEnd();

      return { success: false };
    }

    databaseConnection.close();
    return { success: true };
  } catch(error) {
    databaseConnection.close();

    console.group("Exception caught while deleting extension");
    console.error(error);
    console.groupEnd();

    return { success: false };
  }
}
