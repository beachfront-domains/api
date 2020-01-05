


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
    `Your temporary ${appName} login link`,

    // Body
    `
    <header>
      <div class="inner-wrap">
        <strong class="logo">&there4;</strong> Welcome back
      </div>
    </header>

    <section class="inner-wrap">
      <h2><a href="${siteUrl}/access?token=${tokenToSend}&uid=${encodeURIComponent(recipient)}" title="Login to ${appName}">Login to ${appName}</a></h2>

      <p>Your login link will expire 30 minutes from now.</p>
    </section>
    `
  );

  data.from = `${appName} <${appEmail}>`;
  data.html = email;
  data.subject = `Your temporary ${appName} login link`;
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
