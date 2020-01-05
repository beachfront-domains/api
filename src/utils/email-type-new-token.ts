


//  I M P O R T S

import env from "vne";
import mail from "mailgun-js";

//  U T I L S

import emailTemplate from "./email-template";
import reportError from "./report-error";

const appEmail = env.site.email;
const appName = env.site.name;
const mailgun = mail({ apiKey: env.mailgun.api, domain: env.mailgun.domain });
const siteUrl = process.env.NODE_ENV === "development" ? env.dev.site : env.prod.site;



//  E X P O R T

export default (recipient: string, tokenToSend: string) => {
  const data = {
    from: "",
    html: "",
    subject: "",
    to: ""
  };

  const email = emailTemplate(
    // Title
    `Here is your ${appName} verification token link`,

    // Body
    `
    <header>
      <div class="inner-wrap">
        <strong class="logo">&there4;</strong> Whoops
      </div>
    </header>

    <section class="inner-wrap">
      <p>Follow this link to get your account verified, instantly:</p>

      <p><a href="${siteUrl}/verify?token=${tokenToSend}&amp;uid=${encodeURIComponent(recipient)}" title="Verify your account">Verify your account</a></p>

      <p>Feel free to respond to this email should any shenanigans occur.</p>
    </section>
    `
  );

  data.from = `${appName} <${appEmail}>`;
  data.html = email;
  data.subject = `Your ${appName} verification token`;
  data.to = recipient;

  mailgun.messages().send(data, (mailgunError: object, body: object) => {
    if (mailgunError) {
      reportError({
        additionalInfo: {
          error: mailgunError,
          recipient: data.to,
          subject: data.subject
        },
        errorMessage: "Sending email failed"
      });
    }
  });
};
