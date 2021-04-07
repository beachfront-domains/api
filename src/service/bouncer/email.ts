


///  I M P O R T

import validateEmail from "@webb/validate-email";

///  U T I L

import { FunctionResponseInterface } from "~util/index";

export interface EmailResponseInterface extends FunctionResponseInterface {
  detail: {
    email: string;
  };
}



///  E X P O R T

export default (suppliedEmailAddress: string): EmailResponseInterface => {
  if (!validateEmail(suppliedEmailAddress)) {
    return {
      detail: {
        email: "REDACTED"
      },
      httpCode: 406, // Not Acceptable
      message: "Email validation failed",
      success: false
    };
  }

  return {
    detail: {
      email: String(suppliedEmailAddress).toLowerCase()
    },
    httpCode: 200, // OK
    message: "Email validation successful",
    success: false
  };
};
