


/// import

import { log } from "dep/std.ts";
import { Resend } from "dep/x/resend.ts";

/// util

import {
  client,
  sign,
  validateEmail
} from "src/utility/index.ts";

import e from "dbschema";
import { serviceResend } from "src/utility/env.ts";

import type { DetailObject, StandardResponse } from "src/utility/index.ts";
import type { LoginCreate } from "../schema.ts";

const appURL = "http://localhost:2513";
const thisFilePath = import.meta.filename;



/// export

export default async(_root, args: LoginCreate, _ctx?, _info?): StandardResponse => {
  /// this function needs to be accessible to non-authenticated folks
  const { params } = args;
  const query: any = {};
  let response: DetailObject | null = null;

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "email": {
        query[key] = validateEmail(String(value)) ?
          String(value).toLowerCase() :
          null;
        break;
      }

      default: {
        break;
      }
    }
  });

  /// vibe check
  if (!query.email) {
    const err = "Missing required parameter(s).";

    log.warning(`[${thisFilePath}]› ${err}`);
    return { detail: response, error: { code: "TBA", message: err }};
  }

  const doesCustomerExist = e.select(e.Customer, customer => ({
    ...e.Customer["*"],
    filter_single: e.op(customer.email, "=", query.email)
  }));

  let customerExistenceResult = await doesCustomerExist.run(client);

  if (!customerExistenceResult) {
    /// if customer doesn't exist, create them.
    const newCustomerDetails = {
      email: query.email,
      username: createUsername(query.email)
    };

    try {
      const newDocument = e.insert(e.Customer, { ...newCustomerDetails });
      const databaseQuery = e.select(newDocument, () => ({ ...e.Customer["*"] }));

      customerExistenceResult = await databaseQuery.run(client);
      log.info(`[${thisFilePath}]› Created new customer.`);
    } catch(_) {
      // TODO
      // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
      const err = "New customer creation failed";
      log.error(`[${thisFilePath}]› Exception caught while creating new customer.`);

      return { detail: response, error: { code: "TBA", message: err }};
    }
  }

  try {
    const jwt = sign({
      exp: Math.floor(
        new Date(
          new Date(Date.now()).getTime() + /// currentTime
          15 * 60 * 1000                   /// add 15 minutes
        ).getTime() / 1000                 /// from now (in seconds)
      ),
      sub: `id|${customerExistenceResult.id}` /// unique id of customer
    });

    delete query.email;
    query.token = jwt;

    const newDocument = e.insert(e.Login, {
      ...query,
      /// linked properties require subqueries...kind of a waste of resources
      for: e.select(e.Customer, customer => ({
        filter: e.op(customer.id, "=", e.uuid(customerExistenceResult!.id))
      }))
    });

    const databaseQuery = e.select(newDocument, login => ({
      ...e.Login["*"],
      for: login.for["*"]
    }));

    response = await databaseQuery.run(client);

    const loginLink = `${appURL}/access?${response.token}`;
    const resend = new Resend(serviceResend);

    const emailBody = `
      <p>Hey!</p>
      <p><a href="${loginLink}">Sign-in to beachfront/</a></p>
      <p>If you did not request this link, please ignore this email and enjoy the rest of your day.</p>
      <p>Cordially yours, <a href="${appURL}">beachfront/</a>.</p>
      <p>🏖️</p>
    `;
    const emailBodyPlain = `
      Hey!
      Sign-in to beachfront/:\n
      ${loginLink}\n
      If you did not request this link, please ignore this email and enjoy the rest of your day.
      Cordially yours, beachfront/.\n
      🏖️
    `;

    resend.emails.send({
      from: "beachfront/ <onboarding@beachfront.domains>",
      html: emailBody,
      subject: "Your login link",
      text: emailBodyPlain,
      to: [response.for.email]
    });

    return { detail: response };
  } catch(_) {
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while creating document.`);
    console.log(_);
    return { detail: response };
  }
}



/// helper

function createUsername(suppliedEmail: string): string {
  // TODO
  // : use something like nanoid instead of `Math.random`

  return String(suppliedEmail)
    .split("@")[0]
    .replace(/\+/g, "") + String(Math.random())
    .split(".")[1]
    .slice(0, 5);
}
