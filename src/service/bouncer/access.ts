


///  I M P O R T

import { r } from "rethinkdb-ts";

///  U T I L

import createLink from "./create-link";
import { databaseOptions, FunctionResponseInterface } from "~util/index";
import generatePass from "./generate-pass";
import generateAndStoreToken from "./generate-store-token";
import { sendAuthEmail, sendEmail } from "~service/email";
import { CustomerDefaults } from "~module/customer/default";
import validateEmail from "./email";

export interface EmailResponseInterface extends FunctionResponseInterface {
  detail?: {
    link: string;
  };
}



///  E X P O R T

export default async(suppliedData: { email: string }): Promise<EmailResponseInterface> => {
  const { email } = validateEmail(suppliedData.email).detail;
  const databaseConnection = await r.connect(databaseOptions);

  const customerQuery = await r.table("customers")
    .filter({ email })
    .run(databaseConnection);

  try {
    const customer = customerQuery[0];
    let generatedAutoLoginToken;
    let generatedEmailToken;

    // Customer exists, send auth email
    if (customer) {
      /*
      // Login token
      if (customer.loginMethod && customer.loginMethod === "token") {
        sendAuthEmail({
          emailType: "login-token",
          message: "Email with login token, sent",
          receiver: customerEmail
        });

        databaseConnection.close();

        return { // returning customer
          httpCode: 200,
          message: "Email with login token, sent",
          success: true
        };
      } else { // Login link
      */

      databaseConnection.close();

      sendAuthEmail({
        emailType: "login-link", // this should be the default, and an optional field
        message: "Email with login link, sent",
        receiver: email
      });

      return { // returning customer
        httpCode: 202, // Accepted
        message: "Email with login link, sent",
        success: true
      };
    }

    switch(true) {
      // Customer exists, send auth email // case (customer !== undefined):
      case customer:
        /*
        // Login token
        if (customer.loginMethod && customer.loginMethod === "token") {
          sendAuthEmail({
            emailType: "login-token",
            message: "Email with login token, sent",
            receiver: customerEmail
          });

          databaseConnection.close();

          return { // returning customer
            httpCode: 200,
            message: "Email with login token, sent",
            success: true
          };
        } else { // Login link
        */

        databaseConnection.close();

        sendAuthEmail({
          emailType: "login-link", // this should be the default, and an optional field
          message: "Email with login link, sent",
          receiver: email
        });

        return { // returning customer
          httpCode: 202, // Accepted
          message: "Email with login link, sent",
          success: true
        };

      // Create customer and send login email
      default:
        databaseConnection.close();
        generatedAutoLoginToken = await generateAndStoreToken(email);
        generatedEmailToken = await generatePass(email);

        // try {
        //   await r.table("customers").insert({
        //     ...CustomerDefaults,
        //     ...{
        //       email: customerEmail,
        //       name: "Oh Mysterious One",
        //       username: customerEmail.split("@")[0].replace(/\+/g, "") + Math.random().toString()
        //         .slice(2, 8),
        //       bio: "Hey y'all, welcome to my page! I like connecting with people on social media.",
        //       squad: [beachfrontPaul]
        //     }
        //   })
        //     .run(databaseConnection);
        // } catch(customerCreationError) {
        //   const errorMessage = "Error creating customer";

        //   console.error(errorMessage);
        //   console.error(customerCreationError);

        //   databaseConnection.close();

        //   return {
        //     httpCode: 500, // Internal Server Error
        //     message: errorMessage
        //   };
        // }

        // Send welcome email
        sendEmail({
          authorization: generatedEmailToken,
          emailType: "newbie",
          receiver: email
        });

        console.info("New customer joined Beachfront");
        // databaseConnection.close();

        return {
          detail: {
            // Enable auto-login for new customer
            link: createLink(email, generatedAutoLoginToken), // encoding should be done in the actual function
            // link: generateTokenLink(siteUrl, generatedAutoLoginToken, email),
          },
          httpCode: 201, // Created
          message: "New customer created",
          success: true
        };
    }
  } catch(error) {
    databaseConnection.close();
    const errorMessage = "Error querying customer for signup/login";

    console.error(errorMessage);
    console.error(error);

    return {
      httpCode: 500, // Internal Server Error
      message: errorMessage,
      success: false
    };
  }
};
