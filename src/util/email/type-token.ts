


///  I M P O R T

import env from "vne";
import postmark from "postmark";

///  U T I L

import emailTemplate from "./template";
import { printError } from "../logger";
import { siteEmail, siteName } from "../constant";

const { mail } = env();



///  E X P O R T

export default (recipient: string, tokenToSend: string): void => {
  if (!recipient || !tokenToSend) {
    printError("Missing recipient and/or token values");
    return;
  }

  // TODO
  // When logging in this way, the customer's email is "hardcoded"
  // and only an input for the token is available. On submit,
  // both get sent to this auth service to then allow them in.

  const client = new postmark.ServerClient(mail.api);
  const subject = `Your temporary ${siteName} login code is "${tokenToSend}"`;

  client.sendEmail({
    From: `${siteName} <${siteEmail}>`,
    To: recipient,
    Subject: subject,
    HtmlBody: emailTemplate(
      // Title
      subject,

      // Body
      `
      <header>
        <div class="inner-wrap">Welcome back</div>
      </header>

      <section class="inner-wrap">
        <p>Copy and paste this temporary login code:</p>
        <p>${tokenToSend}</p>
        <p>The code will expire 30 minutes from now.</p>
      </section>
      `
    ),
    TextBody: `Copy and paste this temporary login code:\n\n${tokenToSend}\n\nThe code will expire 30 minutes from now.`,
    MessageStream: "outbound"
  });

  // TODO
  // : do I need to add a return here?
};
