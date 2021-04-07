


///  U T I L

import sendEmail from "./send-email";
import { generateAndStoreToken } from "~service/bouncer/index";



///  E X P O R T

export default async(suppliedData: { emailType: string, message?: string, receiver: string }) => {
  const { emailType, message, receiver } = suppliedData;

  return sendEmail({
    authorization: await generateAndStoreToken(receiver),
    emailType,
    receiver
  });
};
