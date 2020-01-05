


//  U T I L S

import {
  loginDefault,
  newTokenEmail,
  newUserEmail,
  // notificationEmail,
  reportError
} from "~util/index";

const validEmailTypes = [
  "login-link",
  "newbie",
  "notification",
  "verify"
];

class InputType {
  emailType: string;
  recipientEmail: string;
  token: string;
}



//  E X P O R T

export default (suppliedData: InputType) => {
  const { emailType, recipientEmail, token } = suppliedData;

  const missingParameter = {
    name: "Error",
    message: "Missing parameter preventing the sending of email",
    params: {
      emailType: emailType || "",
      recipientEmail: recipientEmail || "",
      token: token || ""
    }
  };

  switch(true) {
    case !emailType:
    case !recipientEmail:
    case !token:
      reportError({
        additionalInfo: missingParameter,
        httpCode: 401,
        serverResponseMessage: "Unauthorized"
      });

      break; // return?

    default:
      break;
  }

  if (validEmailTypes.indexOf(emailType) < 0) {
    reportError({
      additionalInfo: missingParameter,
      errorMessage: "Invalid email type detected",
      httpCode: 401,
      // serverResponse: serverResponse,
      serverResponseMessage: "Unauthorized"
    });
  }

  switch(emailType) {
    case "login-link":
      loginDefault(recipientEmail, token);

      return {
        httpCode: 200,
        message: "Email sent"
      };

      // case emailType === "login-token":
      //   loginToken(recipientEmail, token);
      //   break;

    case "newbie":
      newUserEmail(recipientEmail);

      return {
        httpCode: 201,
        message: "New user email sent"
      };

      // case "notification":
      //   notificationEmail(recipientEmail); // suppliedData

      //   return {
      //     httpCode: 200,
      //     message: "Email sent"
      //   };

    case "verify":
      newTokenEmail(recipientEmail, token);

      return {
        httpCode: 200,
        message: "Email sent"
      };

    default:
      break;
  }
};
