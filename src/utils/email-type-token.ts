


//  I M P O R T S

import env from "vne";
import mail from "mailgun-js";

//  U T I L S

import emailTemplate from "./email-template";
import reportError from "./report-error";

const appEmail = env.site.email;
const appName = env.site.name;
const mailgun = mail({ apiKey: env.mailgun.api, domain: env.mailgun.domain });



//  E X P O R T

export default (recipient: string, tokenToSend: string) => {
  const data = {
    from: "",
    html: "",
    subject: "",
    to: ""
  };

  // TODO:
  // When logging in this way, the user's email is "hardcoded"
  // and only an input for the token is available. On submit,
  // both get sent to this auth service to then allow them in.

  const email = emailTemplate(
    // Title
    `Your temporary ${appName} login code is "${tokenToSend}"`,

    // Body
    `
    <header>
      <div class="inner-wrap">
        <strong class="logo">&there4;</strong> Welcome back
      </div>
    </header>

    <section class="inner-wrap">
      <p>Copy and paste this temporary login code:</p>
      <p>${tokenToSend}</p>
      <p>The code will expire 30 minutes from now.</p>
    </section>
    `
  );

  data.from = `${appName} <${appEmail}>`;
  data.html = email;
  data.subject = `Your temporary ${appName} login code is "${tokenToSend}"`;
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
