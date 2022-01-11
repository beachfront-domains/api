


///  I M P O R T

import { r } from "rethinkdb-ts";

///  U T I L

import { databaseOptions } from "~util/index";
import { get as getOrder } from "./read";
import type { OrderRequest } from "~schema/index";
import type { LooseObject } from "~util/index";

const databaseName = "order";



///  E X P O R T

export default async(suppliedData: OrderRequest) => {
  const databaseConnection = await r.connect(databaseOptions);
  const { options } = suppliedData;
  const query: LooseObject = {};

  Object.entries(options).forEach(([key, value]) => {
    switch(key) {
      case "id":
        query[key] = String(value);
        break;

      default:
        break;
    }
  });

  const doesDocumentExist = await getOrder({ options: { id: query.id }});

  if (doesDocumentExist.detail.id.length === 0) {
    databaseConnection.close();
    /// document does not exist so technically, the desired result is true
    return { success: true };
  }

  /// document exists, so grab ID to locate for deletion
  const documentId = doesDocumentExist.detail.id;

  try {
    const deleteDocument = await r
      .table(databaseName)
      .get(documentId)
      .delete({ returnChanges: true })
      .run(databaseConnection);

    if (deleteDocument.errors !== 0) {
      databaseConnection.close();

      console.group("Order deletion failed");
      console.error(query);
      console.groupEnd();

      return { success: false };
    }

    databaseConnection.close();
    return { success: true };
  } catch(error) {
    databaseConnection.close();

    console.group("Exception caught while deleting order");
    console.error(error);
    console.groupEnd();

    return { success: false };
  }
}
