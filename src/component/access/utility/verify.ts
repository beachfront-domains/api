


// /// import

// import env from "vne";
// import mail from "@sendgrid/mail";
// import validateEmail from "@webb/validate-email";

// /// util

// import { create as createSession } from "src/component/session/index.ts";
// import { create as createCustomer, getCustomer } from "src/component/customer/index.ts";
// import { /*eddsa,*/ environment, LooseObject } from "src/utility/index.ts";
// import { decode, verify } from "src/utility/jsonwebtoken.ts";

// const { dev, key: { encryption }, prod, sendgrid } = env();
// const emptyResponse = { detail: { id: "" }};

// type VerifyRequest = {
//   options: {
//     token: string;
//   }
// };



// /// export

// export default async(input: VerifyRequest) => { // context: LooseObject|null /// context is not used here
//   const api = environment === "development" ? dev.api : prod.api;
//   const app = environment === "development" ? dev.app : prod.app;
//   const { options: { token }} = input;
//   let customer;
//   let customerId: string;
//   let newCustomer = false;

//   if (token.length === 0)
//     return emptyResponse;

//   const jwt = verify(atob(token), encryption);

//   if (!jwt || !jwt.sub || !validateEmail(jwt.sub))
//     return emptyResponse;

//   const email = String(jwt.sub).toLowerCase();
//   const doesDocumentExist = await getCustomer({ options: { email }});

//   if (doesDocumentExist.detail.id.length === 0) {
//     /// customer does not exist, so create them
//     const documentExists = await createCustomer({ options: { email }});
//     customer = documentExists.detail;
//     customerId = documentExists.detail.id;
//   } else {
//     customer = doesDocumentExist.detail;
//     customerId = doesDocumentExist.detail.id;
//   }

//   const session = await createSession({ options: { customer: customerId }});
//   session.detail.customer = customer;

//   return session;
// };

// /*
//   TODO
//   : customer creates login request with their email
//   : API searches database for account related to email
//     : if found, `newCustomer` is set to false
//     : if not found, `newCustomer` is set to true
//     : above is business logic for UI/app
//   : JWT is created and sent in response

//   VERIFY
//   : verify JWT
//   : extract email
//   : look for customer
//     : if not found, create customer
//   : return response
//     : customer
//     : session ID
//   : subsequent calls to API require authorization header with session ID as bearer token on app side
//     : token is refreshed for a week

//   LOGIN
//   : customer can choose instant login after their initial login
//   : initial login also verifies their account since email access is required to click link anyway
// */
