


// /// import

// import dedent from "dedent";
// import env from "vne";
// import mail from "@sendgrid/mail";
// import validateEmail from "@webb/validate-email";

// /// util

// import { getCustomer } from "src/component/customer/index.ts";
// import { /*eddsa,*/ environment, LooseObject } from "src/utility/index.ts";
// import { sign } from "src/utility/jsonwebtoken/index.ts";

// const { dev, key: { encryption }, prod, sendgrid } = env();

// type LoginRequest = {
//   options: {
//     email: string;
//   }
// };



// /// export

// export default async(input: LoginRequest, context: LooseObject|null) => {
//   const api = environment === "development" ? dev.api : prod.api;
//   const app = environment === "development" ? dev.app : prod.app;
//   const { options: { email }} = input;
//   let newCustomer = false;

//   if (!validateEmail(email))
//     return {};

//   const payload = {
//     aud: app, /// audience
//     exp: new Date().getTime() + 30 * 60000, /// expires 30 minutes from now
//     iat: new Date().getTime(), /// issued at
//     iss: api, /// issuer
//     // nbf: new Date().getTime(), /// not before /// TODO: what did i do wrong?
//     sub: email.toLowerCase() /// subject
//   };

//   const doesDocumentExist = await getCustomer({ options: { email }});

//   if (Object.keys(doesDocumentExist.detail).length === 0) {
//     /// customer does not exist, set `newCustomer` to true
//     newCustomer = true;
//   }

//   const jwt = btoa(sign(payload, encryption));
//   // const jwt = btoa(eddsa(payload, encryption));
//   /// $beachfront/type/token / type enums: access | verify
//   const link = `${app}/access/${jwt}`;

//   const body = dedent`
//     <p>Here is your login token, conveniently in <a href="${link}" title="login link for beachfront/">link form</a> for beachfront/.</p>

//     <p>If you prefer to copy/paste the link instead:<br/>
//       <code>
//         <pre>${link.replace("http://", "").replace("https://", "")}</pre>
//       </code>
//     </p>

//     <p>Your link will expire 30 minutes from now.</p>
//   `;

//   const message = {
//     from: {
//       email: "info@beachfront.domains",
//       name: "beachfront / auth"
//     },
//     html: richEmail({ body, title: "「 beachfront/ 」Your login token" }),
//     subject: "「 beachfront/ 」Your login token",
//     text: `Welcome!\n\nHere is your login link for beachfront/.\n${link}`,
//     to: email
//   };

//   try {
//     mail.setApiKey(sendgrid);
//     await mail.send(message);
//   } catch(error: any) {
//     console.error(error);

//     if (error.response)
//       console.error(error.response.body);

//     return {};
//   } finally {
//     return {
//       detail: {
//         link,
//         newCustomer
//       }
//     };
//   }
// };



// /// helper

// function richEmail(input) {
//   const { body, title } = input;

//   return dedent`
//     <html lang="en">
//       <head>
//         <title>${title}</title>
//         <style type="text/css">
//           *, *::before, *::after {
//             margin: 0; padding: 0;
//             box-sizing: border-box;
//           }

//           html {
//             font-family: -system-ui, system-ui, sans-serif;
//             font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "cv10" 1;
//             font-size: 12px;
//             font-variant-ligatures: contextual common-ligatures;
//             letter-spacing: -0.01rem;
//             line-height: 1.33;
//           }

//           body {
//             padding: 2rem;
//           }

//           h1 {
//             font-size: 2rem;
//             margin-bottom: 2rem;
//           }

//           p {
//             font-size: 1.25rem;
//           }

//           p:not(:last-of-type) {
//             margin-bottom: 1rem;
//           }

//           a {
//             color: #4dabf7;
//           }

//           a:visited {
//             color: #9775fa;
//           }

//           code,
//           pre {
//             font-family: monospace;
//             font-variant-numeric: slashed-zero;
//             font-weight: 430;
//             white-space: normal;
//             word-wrap: normal;
//             /* white-space: pre-wrap; */
//             /* word-wrap: break-word; */
//           }

//           code a {
//             color: #228be6;
//           }

//           pre {
//             background-color: #eee;
//             display: block;
//             padding: 0.5rem 0.75rem;
//             /* overflow-x: auto; */
//             /* white-space: pre; */
//           }
//         </style>
//       </head>

//       <body>
//         ${body}
//       </body>
//     </html>
//   `;
// }

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
// */
