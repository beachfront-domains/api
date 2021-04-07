


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
  const subject = `Your temporary ${siteName} login link`;

  // client.sendEmail({
  //   "From": "sender@example.org",
  //   "To": "sender@example.org",
  //   "Subject": "Hello from Postmark",
  //   "HtmlBody": "<strong>Hello</strong> dear Postmark user.",
  //   "TextBody": "Hello from Postmark!",
  //   "MessageStream": "outbound"
  // });

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
        <h2><a href="${createLink(recipient, tokenToSend)}" title="Login to ${siteName}">Login to beachfront</a></h2>
        <p>Your login link will expire 30 minutes from now.</p>
      </section>
      `
    ),
    TextBody: `Welcome back\n\nLogin to beachfront with this link:\n${createLink(recipient, tokenToSend)}\n\nYour login link will expire 30 minutes from now.`,
    MessageStream: "outbound"
  });

  // TODO
  // : do I need to add a return here?
};
