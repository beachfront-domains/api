


///  I M P O R T

import { r } from "rethinkdb-ts";

///  U T I L

import authenticate from "./auth";
import { databaseOptions } from "~util/index";
import { getCustomer } from "~service/human/index";
import type { Customer } from "~module/customer/type";

const errorAuthentication = "Missing authentication";
const errorCredentials = "Invalid credentials";
const errorNoAccount = "Non-existent account";



///  E X P O R T

export default async(suppliedAuthObject: { sessionId: string, customerId: string }) => {
  switch(false) {
    case Object.keys(suppliedAuthObject).length > 0:
    case String(suppliedAuthObject.sessionId).length > 0:
    case String(suppliedAuthObject.customerId).length > 0:
      console.error(errorAuthentication);

      return {
        httpCode: 401,
        message: errorAuthentication,
        success: false
      };

    default:
      break;
  }

  const { sessionId, customerId } = suppliedAuthObject;
  const databaseConnection = await r.connect(databaseOptions);
  // @ts-ignore TS2322: Type "any[] | { httpCode: number; message: string; success: boolean; } | null" is not assignable to type "Customer".
  const customerQuery: Customer = await getCustomer({ id: customerId });

  if (!customerQuery) {
    databaseConnection.close();
    console.error(errorNoAccount);

    return {
      httpCode: 401,
      message: errorNoAccount,
      success: false
    };
  }

  const credentialCheck = await authenticate({ email: String(customerQuery.email), token: String(sessionId) });

  if (!credentialCheck || !credentialCheck.success) {
    databaseConnection.close();
    console.error(errorCredentials);

    return {
      httpCode: 401,
      message: errorCredentials,
      success: false
    };
  }

  return credentialCheck;
  // returns <httpCode: 200, message: "Customer authenticated", success: true, customer: detail>
}
