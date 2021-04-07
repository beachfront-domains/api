


///  I M P O R T

import { r } from "rethinkdb-ts";

///  U T I L

import {
  databaseOptions,
  FunctionResponseInterface,
  printError
} from "~util/index";

import generatePass from "./generate-pass";
import { sendEmail } from "~service/email";
import validateEmail from "./email";
import type { Customer } from "~module/customer/type";



///  E X P O R T

export default async(customerEmail: string): Promise<FunctionResponseInterface> => { // Create and send new verification token
  if (!customerEmail) {
    const errorMessage = "Missing email value";
    printError(errorMessage);

    return {
      httpCode: 401,
      message: errorMessage,
      success: false
    };
  }

  const databaseConnection = await r.connect(databaseOptions);
  const { email } = validateEmail(customerEmail).detail;

  const customerQuery = await r.table("customers")
    .filter({ email })
    .run(databaseConnection);

  try {
    const customer: Customer = customerQuery[0];

    if (customer && !customer.verified) { // customer !== undefined || customer.verified !== true
      databaseConnection.close();

      sendEmail({
        authorization: generatePass(email),
        emailType: "verify",
        receiver: email
      });

      return {
        httpCode: 201,
        message: "Token created and sent",
        success: true
      };
    }

    return {
      httpCode: 200,
      message: "How did you reach this? You should be verified already.",
      success: true
    };
  } catch(error) {
    databaseConnection.close();
    const errorMessage = "Customer query failed for the sending of email verification token";
    printError(errorMessage);

    return {
      httpCode: 401,
      message: errorMessage,
      success: false
    };
  }
};
