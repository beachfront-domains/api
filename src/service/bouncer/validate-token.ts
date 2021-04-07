


///  N A T I V E

import crypto from "crypto";

///  I M P O R T

import { r } from "rethinkdb-ts";

///  U T I L

import {
  databaseOptions,
  FunctionResponseInterface,
  printError,
  redisClient,
  verifyHash,
  verifyProof
} from "~util/index";

import { getCustomer } from "~service/human/index";
import validateEmail from "./email";
import type { Customer } from "~module/customer/type";

const tokenDatabase = "tokens";

export interface FunctionResponse extends FunctionResponseInterface {
  detail?: {
    customer?: Customer | {};
    session?: string;
  };
}



///  E X P O R T

export default async(suppliedData: { email: string, token: string }): Promise<FunctionResponse> => {
  const databaseConnection = await r.connect(databaseOptions);
  const { token } = suppliedData;
  const { email } = validateEmail(suppliedData.email).detail;

  const tokenQuery = await r.table(tokenDatabase)
    .filter({ uid: email })
    .run(databaseConnection);

  try {
    const tokenResult = tokenQuery[0];

    if (!tokenResult || tokenResult === undefined) {
      databaseConnection.close();

      const errorMessage = "No token found for email address";
      printError(errorMessage);

      return {
        httpCode: 401,
        message: errorMessage,
        success: false
      };
    }

    // If current time is later than the expiration of the token, no go
    if (Date.now() > +new Date(tokenResult.ttl)) {
      databaseConnection.close();

      const errorMessage = "Token has expired";
      printError(errorMessage);

      return {
        httpCode: 401,
        message: errorMessage,
        success: false
      };
    }

    try {
      verifyHash(token, tokenResult.hash);
    } catch(hashVerificationError) {
      databaseConnection.close();

      const errorMessage = "Hash verification for token failed";
      printError(errorMessage);

      return {
        httpCode: 401,
        message: errorMessage,
        success: false
      };
    }

    try {
      verifyProof(tokenResult.token);
    } catch(tokenVerificationError) {
      databaseConnection.close();

      const errorMessage = "Token verification failed";
      printError(errorMessage);

      return {
        httpCode: 401,
        message: errorMessage,
        success: false
      };
    }

    try {
      const sessionId = crypto.randomBytes(20).toString("hex");

      redisClient.set(
        sessionId,
        JSON.stringify({
          // expires: new Date(new Date().getTime() + 6.04e+8), // Expire this key a week from now
          expires: Date.now() + 6.04e+8, // Expire this key a week from now
          customer: tokenResult.uid
        })
      );

      // Delete token
      await r.table(tokenDatabase)
        .get(tokenResult.id)
        .delete()
        .run(databaseConnection);

      databaseConnection.close();

      return {
        detail: {
          customer: await getCustomer({ email }),
          session: sessionId
        },
        httpCode: 200,
        message: "Validated",
        success: true
      };
    } catch(sessionSettingError) {
      databaseConnection.close();

      const errorMessage = "Session setting failed";
      printError(errorMessage);

      return {
        httpCode: 500,
        message: errorMessage,
        success: false
      };
    }
  } catch(tokenQueryError) {
    databaseConnection.close();

    const errorMessage = "Token query failed validation";
    printError(errorMessage);

    return {
      httpCode: 401,
      message: errorMessage,
      success: false
    };
  }
};
