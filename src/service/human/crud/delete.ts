


///  I M P O R T

import { r } from "rethinkdb-ts";

///  U T I L

import bouncer from "~service/bouncer/api-auth";

import {
  databaseOptions,
  FunctionResponseInterface,
  printError
} from "~util/index";



///  E X P O R T

export default async(suppliedData: { sessionId: string, customerId: string }): Promise<FunctionResponseInterface> => {
  const databaseConnection = await r.connect(databaseOptions);
  const vibeCheck = await bouncer(suppliedData);

  if (!vibeCheck.detail) {
    const errorMessage = "Unauthorized";
    printError(errorMessage);

    return {
      httpCode: 401,
      message: errorMessage,
      success: false
    };
  }

  const { customer } = vibeCheck.detail;

  // TODO
  // : queue account deletions?
  // : update all customer's posts with comments to have the DELETED USER profile
  //   : render post readonly
  //   : `repliedBy` populated
  // : delete all redis sessions
  // : all other posts should be deleted, along with attached media

  if (suppliedData.customerId !== customer.id) {
    const errorMessage = "Unauthorized";
    printError(errorMessage);

    return {
      httpCode: 401,
      message: errorMessage,
      success: false
    };
  }

  try {
    // await r.table("posts") // delete all posts from this customer
    //   .filter({ author: customer.id })
    //   .delete({ durability: "soft" })
    //   .run(databaseConnection);

    const deleteCustomer = await r.table("customers").get(customer.id)
      .delete({ returnChanges: true })
      .run(databaseConnection);

    if (deleteCustomer.errors !== 0) {
      const errorMessage = "Customer deletion unsuccessful";

      databaseConnection.close();
      printError(errorMessage);

      return {
        httpCode: 500,
        message: errorMessage,
        success: false
      };
    }

    return {
      httpCode: 200,
      message: "Customer deletion successful",
      success: true
    };
  } catch(customerDeletionError) {
    const errorMessage = "Customer deletion failed spectacularly";

    databaseConnection.close();
    printError(errorMessage);

    return {
      httpCode: 500,
      message: errorMessage,
      success: false
    };
  }
};
