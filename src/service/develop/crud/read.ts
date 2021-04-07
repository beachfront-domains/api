


///  I M P O R T

import { r } from "rethinkdb-ts";

///  U T I L

import bouncer from "~service/bouncer/api-auth";

import {
  databaseOptions,
  FunctionResponseInterface,
  LooseObjectInterface,
  printError
} from "~util/index";

import type { Customer } from "~module/customer/type";

const keyDatabase = "keys";

export interface KeyRequestInterface {
  auth: {
    customerId: string;
    sessionId: string;
  };
};

export interface KeyResponseInterface extends FunctionResponseInterface {
  detail?: {
    key: string;
    owner: Customer;
  };
}



///  E X P O R T

export default async (suppliedData: KeyRequestInterface): Promise<KeyResponseInterface> => {
  const auth = suppliedData.auth;
  const databaseConnection = await r.connect(databaseOptions);
  const query: LooseObjectInterface = {};
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

  let response: LooseObjectInterface = await r
    .table(keyDatabase)
    .filter({ owner: customer.id })
    .run(databaseConnection);

  try {
    response = response[0];
    databaseConnection.close();

    if (!response) {
      return {
        httpCode: 200,
        message: "Key retrieval failed",
        success: false
      };
    }

    return {
      detail: {
        key: response.key,
        owner: customer
      },
      httpCode: 200,
      message: "Key retrieval successful",
      success: true
    };
  } catch(error) {
    const errorMessage = "Error retrieving key";

    databaseConnection.close();
    printError(errorMessage);

    return {
      httpCode: 500,
      message: errorMessage,
      success: false
    };
  }
}
