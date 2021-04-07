


///  U T I L

import {
  emailTypes,
  FunctionResponseInterface,
  loginDefault,
  // loginToken,
  newTokenEmail,
  newCustomerEmail,
  // notificationEmail,
  printError,
  sanityCheck
} from "~util/index";

interface IncomingDataInterface {
  authorization?: string | Promise<string>;
  emailType: string;
  receiver: string;
};



///  E X P O R T

export default (suppliedData: IncomingDataInterface): FunctionResponseInterface => {
  const { authorization, emailType, receiver } = suppliedData;
  let token: string = "";

  sanityCheck({
    checkEnum: {
      array: emailTypes,
      search: emailType
    },
    checkExist: [
      emailType,
      receiver
    ],
    checkLength: [String(authorization)]
  });

  if (authorization)
    token = String(authorization);

  switch(emailType) {
    case "login-link":
      loginDefault(receiver, token);

      return {
        httpCode: 200,
        message: "Email sent",
        success: true
      };

    /*
    case "login-token":
      loginToken(receiver, token);

      return {
        httpCode: 200,
        message: "Email sent",
        success: true
      };
    */

    case "newbie":
      newCustomerEmail(receiver);

      return {
        httpCode: 201,
        message: "New customer email sent",
        success: true
      };

    /*
    case "notification":
      notificationEmail(receiver, data);

      return {
        httpCode: 200,
        message: "Email sent",
        success: true
      };
    */

    case "verify":
      newTokenEmail(receiver, token);

      return {
        httpCode: 200,
        message: "Email sent",
        success: true
      };

    default:
      return {
        httpCode: 401,
        message: "Unauthorized",
        success: false
      };
  }
};
