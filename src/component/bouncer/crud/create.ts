


/// import

import env from "vne";
import { nanoid } from "nanoid";

/// util

import { apiURL, databaseOptions, siteURL } from "src/utility/index.ts";
import { sign } from "src/utility/jsonwebtoken/index.ts";

const { key } = env();
const passDatabase = "pass";
const { secret } = key;



/// export

export function createLink(token: string, type?: "access" | "verify"): string {
  if (!type)
    type = "access";

  /// $beachfront/type/token
  return `${siteURL}/${type}/${token}`;
}

export function createLinkII(baseURL: string, token: string, email: string): string {
  /// The ampersand is not escaped on purpose, error occurs otherwise
  return `${baseURL}/access?token=${token}&uid=${encodeURIComponent(email)}`;
}

// export async function createPass(email: string): Promise<string> {
//   const options = {
//     expires: 6.04e+8, /// week in seconds
//     subject: email
//   };

//   const databaseConnection = await r.connect(databaseOptions);
//   const pass = createToken(nanoid(), options);
//   const hash = bcrypt.hashSync(pass, 5)
//     .replace(/([$|/])/g, "")
//     .slice(0, 11);

//   /// Delete all existing passes for this customer
//   await r.table(passDatabase)
//     .filter({ uid: email })
//     .delete()
//     .run(databaseConnection);

//   try {
//     const data = {
//       hash,
//       pass,
//       uid: email
//     };

//     /// Create new pass
//     await r.table(passDatabase)
//       .insert({ ...data })
//       .run(databaseConnection);
//   } catch(error) {
//     databaseConnection.close();

//     console.group("Exception caught while creating pass");
//     console.error(error);
//     console.groupEnd();

//     return "";
//   }

//   databaseConnection.close();
//   return hash;
// };

// export function createToken(data: string, options: { expires?: string, subject: string }): string {
//   const expiresDefault = "30m";

//   const token = sign({
//     auth: data
//   }, secret, {
//     // algorithm: "RS256", /// why does this fail?
//     // algorithm: "HS512", /// HS256 is the default
//     audience: siteURL,
//     expiresIn: options.expires || expiresDefault,
//     issuer: apiURL,
//     subject
//   });

//   return token;
// };
