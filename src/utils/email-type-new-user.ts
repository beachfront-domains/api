


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

export default (recipient: string) => { // , tokenToSend
  const data = {
    from: "",
    html: "",
    subject: "",
    to: ""
  };

  const email = emailTemplate(
    // Title
    `Welcome to ${appName}`,

    // Body
    `
    <header>
      <div class="inner-wrap">
        <strong class="logo">&there4;</strong> Woohoo
      </div>
    </header>

    <section class="inner-wrap">
      <p>This is <em>fantastic</em>, <strong>thank you</strong> for being part of ${appName}! We hope you enjoy your stay.</p>
    </section>
    `

    // `
    // <header>
    //   <div class="inner-wrap">
    //     <strong class="logo">&there4;</strong> Woohoo
    //   </div>
    // </header>

    // <p class="inner-wrap">This is <em>fantastic</em>, <strong>thank you</strong> for being part of ${appName}! If you don't mind, could you verify your email address?</p>

    // <p class="inner-wrap"><a href="${siteUrl}/verify?token=${tokenToSend}&amp;uid=${encodeURIComponent(recipient)}" title="Verify your email address">Verify your email address</a></p>

    // <p class="inner-wrap">Feel free to respond to this email should any shenanigans occur.</p>
    // `
  );

  data.from = `${appName} <${appEmail}>`;
  data.html = email;
  data.subject = `Welcome to ${appName}`;
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
