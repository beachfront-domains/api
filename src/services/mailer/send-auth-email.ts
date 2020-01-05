


//  U T I L S

import sendEmail from "./send-email";
import { generateAndStoreToken } from "~module/token/auth";

//  T Y P E
type SuppliedType = {
  emailAddress: string;
  emailType: string;
  // serverRequest: any,
  // serverResponse: any,
  serverResponseMessage: any;
};



//  E X P O R T

export default async(suppliedData: SuppliedType) => {
  const { emailAddress, emailType, serverResponseMessage } = suppliedData;

  // $FlowFixMe: Cannot call sendEmail with object literal bound to suppliedData because object literal is incompatible with InputType.
  sendEmail({
    emailType: emailType,
    recipientEmail: emailAddress,
    token: await generateAndStoreToken(emailAddress)
  });

  return {
    httpCode: 200,
    message: serverResponseMessage
  };
};
