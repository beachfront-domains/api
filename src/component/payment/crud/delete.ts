


/// import

import { r } from "rethinkdb-ts";

/// util

import { databaseName } from "../utility/constant.ts";
import { databaseOptions } from "src/utility/index.ts";
import { get as getPaymentMethod } from "./read.ts";
import type { Customer, PaymentMethodRequest } from "src/schema/index.ts";
import type { LooseObject } from "src/utility/index.ts";

const failedResponse = { success: false };
const successResponse = { success: true };



/// export

export default async(data: PaymentMethodRequest, context: Customer): Promise<{ success: Boolean }> => {
  if (!context || !context.id)
    return failedResponse;

  const databaseConnection = await r.connect(databaseOptions);
  const { options } = data;
  const query: LooseObject = {};

  Object.entries(options).forEach(([key, value]) => {
    switch(key) {
      case "id":
      case "vendorId":
        query[key] = String(value);
        break;

      default:
        break;
    }
  });

  const doesDocumentExist = await getPaymentMethod({ options: { ...query }}, context);

  if (doesDocumentExist.detail.id.length === 0) {
    databaseConnection.close();
    /// document does not exist so technically, the desired result is true
    return successResponse;
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

      console.group("Payment method deletion failed");
      console.error(query);
      console.groupEnd();

      return failedResponse;
    }

    databaseConnection.close();
    return successResponse;
  } catch(error) {
    databaseConnection.close();

    console.group("Exception caught while deleting payment method");
    console.error(error);
    console.groupEnd();

    return failedResponse;
  }
}
