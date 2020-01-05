"use strict";



//  I M P O R T

import { r } from "rethinkdb-ts";

//  U T I L S

import {
  databaseOptions,
  log,
  validateEmail
} from "~util/index";

import { generatePass } from "~module/pass/auth";
import { sendEmail } from "~service/mailer";



//  E X P O R T

export default async(responseObject: any, userEmail: string) => { // Create and send new verification token
  const databaseConnection = await r.connect(databaseOptions);

  if (!validateEmail(userEmail)) {
    const errorMessage = "Email validation failed";

    log.error(errorMessage);
    return responseObject.send(401, { message: errorMessage });
  }

  const userQuery = await r.table("users").filter({ email: userEmail })
    .run(databaseConnection);

  try {
    const user = userQuery[0];

    switch(true) {
      // User exists and has not been verified
      case (user !== undefined):
      case (user.verified !== true):
        databaseConnection.close();
        // $FlowFixMe: Cannot call sendEmail with object literal bound to suppliedData because object literal is incompatible with InputType.
        sendEmail({
          emailType: "verify",
          recipientEmail: userEmail,
          token: String(generatePass(responseObject, userEmail))
        });
        return responseObject.send(200, { message: "New token sent" });

      default:
        databaseConnection.close();
        log.error("This should not be reached");
        return;
    }
  } catch(error) {
    databaseConnection.close();
    const errorMessage = "User query failed for the sending of email verification token";

    log.error(errorMessage);
    return responseObject.send(401, { message: errorMessage });
  }
};
