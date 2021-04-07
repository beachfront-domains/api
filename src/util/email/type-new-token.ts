


///  I M P O R T

import env from "vne";
import postmark from "postmark";

///  U T I L

import { createLink } from "~service/bouncer/index";
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

  const client = new postmark.ServerClient(mail.api);
  const subject = `Here is your ${siteName} verification token link`;

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
        <div class="inner-wrap">Woohoo</div>
      </header>

      <section class="inner-wrap">
        <p>Follow this link to get your account verified, instantly:</p>

        <p><a href="${createLink(encodeURIComponent(recipient), tokenToSend, "verify")}" title="Verify your account">Verify your account</a></p>

        <p>Feel free to respond to this email should any shenanigans occur.</p>
      </section>
      `
    ),
    TextBody: `Follow this link to get your account verified, instantly:\n\nVerify your account with this link:\n${createLink(encodeURIComponent(recipient), tokenToSend, "verify")}\n\nFeel free to respond to this email should any shenanigans occur.`,
    MessageStream: "outbound"
  });

  // TODO
  // : do I need to add a return here?
};
