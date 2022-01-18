


///  I M P O R T

import env from "vne";
import mail from "@sendgrid/mail";
import validateEmail from "@webb/validate-email";

///  U T I L

import { getCustomer } from "~service/customer/index";
import { /*eddsa,*/ environment, LooseObject } from "~util/index";
import { sign } from "~util/jsonwebtoken/index";
const { dev, key: { encryption }, prod, sendgrid } = env();

type LoginRequest = {
  options: {
    email: string;
  }
};



///  E X P O R T

export default async(input: LoginRequest, context: LooseObject|null) => {
  const api = environment === "development" ? dev.api : prod.api;
  const app = environment === "development" ? dev.app : prod.app;
  const { options: { email }} = input;
  let newCustomer = false;

  if (!validateEmail(email))
    return {};

  const payload = {
    aud: app, /// audience
    exp: new Date().getTime() + 30 * 60000, /// expires 30 minutes from now
    iat: new Date().getTime(), /// issued at
    iss: api, /// issuer
    // nbf: new Date().getTime(), /// not before /// TODO: what did i do wrong?
    sub: email.toLowerCase() /// subject
  };

  const doesDocumentExist = await getCustomer({ options: { email }});

  if (Object.keys(doesDocumentExist.detail).length === 0) {
    /// customer does not exist, set `newCustomer` to true
    newCustomer = true;
  }

  const jwt = btoa(sign(payload, encryption));
  // const jwt = btoa(eddsa(payload, encryption));
  /// $beachfront/type/token / type enums: access | verify
  const link = `${app}/access/${jwt}`;

  const message = {
    from: "info@beachfront.domains",
    html: `<h1>Welcome</h1><p>Here is your <a href="${link}" title="login link for beachfront/">login link</a> for beachfront/.<br/><code>${link}</code></p>`,
    subject: "Your beachfront/ login token",
    text: `Welcome!\n\nHere is your login link for beachfront/.\n${link}`,
    to: email
  };

  try {
    mail.setApiKey(sendgrid);
    await mail.send(message);
  } catch(error: any) {
    console.error(error);

    if (error.response)
      console.error(error.response.body);

    return {};
  } finally {
    return {
      detail: {
        link,
        newCustomer
      }
    };
  }
};

/*
  TODO
  : customer creates login request with their email
  : API searches database for account related to email
    : if found, `newCustomer` is set to false
    : if not found, `newCustomer` is set to true
    : above is business logic for UI/app
  : JWT is created and sent in response

  VERIFY
  : verify JWT
  : extract email
  : look for customer
    : if not found, create customer
  : return response
    : customer
    : session ID
  : subsequent calls to API require authorization header with session ID as bearer token on app side
    : token is refreshed for a week
*/
