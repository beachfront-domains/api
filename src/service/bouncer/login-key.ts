


///  I M P O R T

import { r } from "rethinkdb-ts";

///  U T I L

import { databaseOptions, FunctionResponseInterface } from "~util/index";
import type { Customer } from "~module/customer/type";
import { getCustomer } from "~service/human/crud/read";

const keyDatabase = "keys";

export interface LoginKeyResponseInterface extends FunctionResponseInterface {
  detail?: {
    key: string;
    owner: Customer;
  };
}



///  E X P O R T

export default async(suppliedData: { key: string }): Promise<LoginKeyResponseInterface> => {
  if (!suppliedData || !suppliedData.key) {
    return {
      httpCode: 401,
      message: "Unauthorized",
      success: false
    };
  }

  const databaseConnection = await r.connect(databaseOptions);
  const { key } = suppliedData;

  try {
    let keyExists = await r
      .table(keyDatabase)
      .filter({ key })
      .run(databaseConnection);

    databaseConnection.close();
    keyExists = keyExists[0];

    if (!keyExists) {
      return {
        httpCode: 404,
        message: "Key does not exist",
        success: false
      };
    }

    // @ts-ignore
    const customer = await getCustomer({ id: keyExists.owner });

    if (!customer || Object.keys(customer).length === 0) {
      return {
        httpCode: 404,
        message: "Customer does not exist but key does? Curious.",
        success: false
      };
    }

    return {
      detail: {
        // @ts-ignore
        key: keyExists.key,
        // @ts-ignore
        owner: customer
      },
      httpCode: 200,
      message: "Login successful",
      success: true
    };
  } catch(keyError) {
    databaseConnection.close();
    console.error(keyError);

    return {
      httpCode: 500,
      message: "Error logging into account via API key. Try again later.",
      success: false
    };
  }
};
