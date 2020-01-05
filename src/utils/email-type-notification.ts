


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

const validNotificationActions = [
  "favorite",
  "invite",
  "reply",
  "squad"
];

//  T Y P E

type Notification = {
  action?: string;
  content?: string;
  fromUsername: string;
  slug?: string;
};

// type NotificationActions = "favorite" | "invite" | "reply" | "squad";



//  E X P O R T

export default (recipientEmail: string, notificationDetails: Notification) => {
  if (validNotificationActions.indexOf(notificationDetails.action) < 0) {
    reportError({
      additionalInfo: {
        email: recipientEmail
      },
      errorMessage: "Invalid email action type",
      httpCode: 401,
      serverResponseMessage: "Unauthorized"
    });
  }

  const { action, content, fromUsername } = notificationDetails;
  const emailSubject = notificationSubjectCreator(String(action), fromUsername);

  const data = {
    from: "",
    html: "",
    subject: "",
    to: ""
  };

  const email = emailTemplate(
    // Title
    emailSubject,

    // Body
    `
    <header>
      <div class="inner-wrap">
        <strong class="logo">&there4;</strong> Notification
      </div>
    </header>

    ${String(notificationBodyCreator(String(action), String(content), notificationDetails))}
    `
  );

  data.from = `${appName} <${appEmail}>`;
  data.html = email;
  data.subject = emailSubject;
  data.to = recipientEmail;

  mailgun.messages().send(data, (mailgunError: object, body: object) => {
    if (mailgunError) {
      reportError({
        additionalInfo: {
          error: mailgunError,
          recipient: recipientEmail,
          subject: emailSubject
        },
        errorMessage: "Sending email failed"
      });
    }
  });
};



//  S U B J E C T
//  C R E A T O R (notifications)

function notificationSubjectCreator(notificationAction: string, notificationInitiator: string) {
  switch(notificationAction) {
    case "favorite":
      return `[${appName.toLowerCase()}] Your post was favorited by ${notificationInitiator}`;

    case "invite":
      return `[${appName.toLowerCase()}] You have an invite from ${notificationInitiator}`;

    case "reply":
      return `[${appName.toLowerCase()}] Your post has a reply from ${notificationInitiator}`;

    case "squad":
      return `[${appName.toLowerCase()}] You have been added to ${notificationInitiator}'s squad`;

    default:
      return "";
  }
}



//  ~     B O D Y
//  C R E A T O R (notifications)

function notificationBodyCreator(
  notificationAction: string,
  notificationContent: string,
  notificationDetails: Notification
) {
  switch(notificationAction) {
    case "favorite":
      return `
        <section class="inner-wrap">
          <p>Your post was favorited!</p>
          <p><a href="${siteUrl}/s/${String(notificationDetails.slug)}">Check it out</a></p>
        </section>
      `;

    case "invite":
      return `
        <p class="inner-wrap">You have been invited to join...something. This email template should not be sent out right now. What is going on?</p>
      `;

    case "reply":
      return `
        <section class="inner-wrap">
          <h2>Reply from ${notificationDetails.fromUsername} &middot; <a href="${siteUrl}/s/${String(notificationDetails.slug)}" title="Reply to ${notificationDetails.fromUsername}">reply</a></h2>

          <div class="reply"></div>
        </section>
      `;

    case "squad":
      // TODO: Add pronoun here
      return `
        <section class="inner-wrap">
          <p>Look at you, so popular! <strong>&there4;&thinsp;${notificationDetails.fromUsername}</strong> just added you to their Top Friends. Talk about prime real estate!</p>
          <p><a href="${siteUrl}/${notificationDetails.fromUsername}">Check it out</a></p>
        </section>
      `;

    default:
      break;
  }
}
