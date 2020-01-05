"use strict";



//  N A T I V E

import crypto from "crypto";

//  I M P O R T

import { r } from "rethinkdb-ts";

//  U T I L S

import {
  databaseOptions,
  log,
  redisClient,
  verifyHash,
  verifyProof,
  weekInSeconds
} from "~util/index";

import { getUser } from "~module/user/query";



//  E X P O R T

export default async(suppliedData: { email: string; token: string }) => {
  const databaseConnection = await r.connect(databaseOptions);
  const hash = suppliedData.token;
  const { email } = suppliedData;
  const tokenQuery = await r.table("tokens").filter({ uid: email })
    .run(databaseConnection);

  try {
    const tokenResult = tokenQuery[0];

    if (!tokenResult || tokenResult === undefined) {
      databaseConnection.close();
      const errorMessage = "No token found for email address";

      log.error(errorMessage);

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

      log.error(errorMessage);

      return {
        httpCode: 401,
        message: errorMessage,
        success: false
      };
    }

    try {
      verifyHash(hash, tokenResult.hash);
    } catch(hashVerificationError) {
      databaseConnection.close();
      const errorMessage = "Hash verification for token failed";

      log.error(errorMessage);

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

      log.error(errorMessage);

      return {
        httpCode: 401,
        message: errorMessage,
        success: false
      };
    }

    try {
      const sessionId = crypto.randomBytes(20).toString("hex");

      redisClient.set(sessionId, JSON.stringify({
        expires: Date.now() + weekInSeconds, // Expire this key a week from now
        user: tokenResult.uid
      }));

      // Delete token
      await r.table("tokens").get(tokenResult.id)
        .delete()
        .run(databaseConnection);

      databaseConnection.close();

      return {
        httpCode: 200,
        message: "Validated",
        session: sessionId,
        success: true,
        user: await getUser({ email })
      };
    } catch(sessionSettingError) {
      databaseConnection.close();
      const errorMessage = "Session setting failed";

      log.error(errorMessage);

      return {
        httpCode: 500,
        message: errorMessage,
        success: false
      };
    }
  } catch(tokenQueryError) {
    databaseConnection.close();
    const errorMessage = "Token query failed validation";

    log.error(errorMessage);

    return {
      httpCode: 401,
      message: errorMessage,
      success: false
    };
  }
};
