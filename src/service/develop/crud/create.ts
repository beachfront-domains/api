


///  I M P O R T

import { r } from "rethinkdb-ts";

///  U T I L

import bouncer from "~service/bouncer/api-auth";
import apiKeyGenerator from "../util/generate-key";

import {
  databaseOptions,
  FunctionResponseInterface,
  printError
} from "~util/index";

import type { Customer } from "~module/customer/type";

const keyDatabase = "keys";

export interface KeyRequestInterface {
  auth: {
    sessionId: string;
    customerId: string;
  };
};

export interface KeyResponseInterface extends FunctionResponseInterface {
  detail?: {
    key: string;
  };
}



///  E X P O R T

export default async (suppliedData: KeyRequestInterface): Promise<KeyResponseInterface> => {
  const auth = suppliedData.auth;
  const databaseConnection = await r.connect(databaseOptions);
  const vibeCheck = await bouncer(auth);

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

  if (auth.customerId !== customer.id) {
    const errorMessage = "Unauthorized";
    printError(errorMessage);

    return {
      httpCode: 401,
      message: errorMessage,
      success: false
    };
  }

  try {
    await r
      .table(keyDatabase) /// delete all API tokens from this customer
      .filter({ owner: customer.id })
      .delete({ durability: "soft" })
      .run(databaseConnection);

    const apiKeyBase = String(customer.id).split("-")[0];

    if (apiKeyBase.length === 0) {
      const errorMessage = "Key creation failed due to customer issue";

      databaseConnection.close();
      printError(errorMessage);

      return {
        httpCode: 500,
        message: errorMessage,
        success: false
      };
    }

    const newApiKey = apiKeyGenerator(apiKeyBase);

    const keyCreation = await r
      .table(keyDatabase)
      .insert({
        key: newApiKey,
        owner: customer.id
      })
      .run(databaseConnection);

    if (keyCreation.inserted !== 1) {
      const errorMessage = "Key creation failed";

      databaseConnection.close();
      printError(errorMessage);

      return {
        httpCode: 500,
        message: errorMessage,
        success: false
      };
    }

    return {
      detail: {
        key: newApiKey
      },
      httpCode: 200,
      message: "Key creation successful",
      success: true
    };
  } catch(customerDeletionError) {
    const errorMessage = "Key creation failed spectacularly";

    databaseConnection.close();
    printError(errorMessage);

    return {
      httpCode: 500,
      message: errorMessage,
      success: false
    };
  }
};
