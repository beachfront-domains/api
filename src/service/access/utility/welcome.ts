


///  I M P O R T

import * as crypto from "crypto";
import * as jose from "jose";
import env from "vne";
import mail from "@sendgrid/mail";

import base64url from "base64url";
import ed25519 from "ed25519";

///  U T I L

import { getCustomer } from "~service/customer/index";
import { eddsa, environment, LooseObject } from "~util/index";
const { dev, key, prod, sendgrid } = env();

type LoginRequest = {
  options: {
    email: string;
  }
};

type SendGridError = {
  code: number;
  response: {
    headers: LooseObject;
    body: {
      errors: string[]
    }
  }
};



///  E X P O R T

export default async(input: LoginRequest, context: LooseObject|null) => {
  const api = environment === "development" ? dev.api : prod.api;
  const app = environment === "development" ? dev.app : prod.app;
  const { options : { email } = { email: "" }} = input;
  const secretKey = key.encryption;
  let newCustomer = false;

  if (email.length === 0)
    return {};

  const payload = {
    aud: app, /// audience
    exp: new Date(new Date().getTime() + 30 * 60000), /// expires 30 minutes from now
    iat: new Date().getTime(), /// issued at
    iss: api, /// issuer
    nbf: new Date().getTime(), /// not before
    sub: email /// subject
  };

  const doesDocumentExist = await getCustomer({ options: { email }});

  if (Object.keys(doesDocumentExist.detail).length === 0) {
    /// customer does not exist, set `newCustomer` to true
    newCustomer = true;
  }

  const jwt = btoa(eddsa(payload, secretKey));
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
