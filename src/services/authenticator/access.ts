


//  I M P O R T

import { r } from "rethinkdb-ts";

//  U T I L S

import {
  databaseOptions,
  generateTokenLink,
  siteUrl,
  log,
  validateEmail
} from "~util/index";

import { generatePass } from "~module/pass/auth";
import { generateAndStoreToken } from "~module/token/auth";
import { sendAuthEmail, sendEmail } from "../mailer";
import { UserDefaults } from "~module/user/schema";



//  E X P O R T

export default async(suppliedData: { email: string }) => {
  const databaseConnection = await r.connect(databaseOptions);
  const { email } = suppliedData;
  const userEmail = email.toLowerCase();

  const userQuery = await r.table("users").filter({ email: userEmail })
    .run(databaseConnection);

  if (!validateEmail(userEmail)) {
    databaseConnection.close();
    const errorMessage = "Email validation failed";

    log.error(errorMessage);

    return {
      httpCode: 500,
      message: errorMessage
    };
  }

  try {
    const user = userQuery[0];

    let generatedAutoLoginToken;
    let generatedEmailToken;

    switch(true) {
      // User exists, send auth email
      case user !== undefined:
        // Login token
        if (user.loginMethod && user.loginMethod === "token") {
          sendAuthEmail({
            emailType: "login-token",
            emailAddress: userEmail,
            serverResponseMessage: "Email with login token, sent"
          });

          databaseConnection.close();

          return { // returning user
            httpCode: 200,
            message: "Email with login token, sent",
            success: true
          };
        } else { // Login link
          sendAuthEmail({
            emailType: "login-link",
            emailAddress: userEmail,
            serverResponseMessage: "Email with login link, sent"
          });

          databaseConnection.close();

          return { // returning user
            httpCode: 200,
            message: "Email with login link, sent",
            success: true
          };
        }

      // Create user and send login email
      default:
        generatedAutoLoginToken = await generateAndStoreToken(userEmail);
        generatedEmailToken = await generatePass(userEmail);

        try {
          await r.table("users").insert({
            ...UserDefaults,
            ...{
              email: userEmail,
              name: "Oh Mysterious One",
              login: formatInitialLogin(userEmail)
            }
          })
            .run(databaseConnection);
        } catch(userCreationError) {
          const errorMessage = "Error creating user";

          log.error(errorMessage);
          log.error(userCreationError);

          databaseConnection.close();

          return {
            httpCode: 500,
            message: errorMessage
          };
        }

        // $FlowFixMe: Cannot call sendEmail with object literal bound to suppliedData because object literal is incompatible with InputType.
        sendEmail({
          emailType: "newbie",
          recipientEmail: userEmail,
          token: generatedEmailToken
        });

        log.info("New user joined Beachfront");
        databaseConnection.close();

        return {
          httpCode: 201,
          message: "New user created",
          // Enable auto-login for new user
          link: generateTokenLink(siteUrl, generatedAutoLoginToken, userEmail),
          success: true
        };
    }
  } catch(error) {
    const errorMessage = "Error querying user for signup/login";

    log.error(errorMessage);
    log.error(error);

    databaseConnection.close();

    return {
      httpCode: 500,
      message: errorMessage
    };
  }
};



//  H E L P E R

function formatInitialLogin(suppliedText: string) {
  return suppliedText.split("@")[0].replace(/\+/g, "") + Math.random().toString()
    .slice(2, 8);
}
