


///  I M P O R T

import env from "vne";
import postmark from "postmark";

///  U T I L

import emailTemplate from "./template";
import { printError } from "../logger";
import { siteEmail, siteName } from "../constant";

const { mail } = env();



///  E X P O R T

export default (recipient: string): void => {
  if (!recipient) {
    printError("Missing recipient value");
    return;
  }

  const client = new postmark.ServerClient(mail.api);
  const subject = `Welcome to ${siteName}`;

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
        <p>This is <em>fantastic</em>, <strong>thank you</strong> for being part of ${siteName}! We hope you enjoy your stay.</p>
      </section>
      `
    ),
    TextBody: `This is _fantastic_, **thank you** for being part of ${siteName}! We hope you enjoy your stay.`,
    MessageStream: "outbound"
  });

  // TODO
  // : do I need to add a return here?
};
