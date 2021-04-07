


///  U T I L

import { printError, siteUrl } from "~util/index";



///  E X P O R T

export default (email: string, token: string, type?: string): string => {
  if (!email || !token) {
    printError("Missing recipient and/or token values");
    return "";
    // ^ this should never be reached, but you never know!
  }

  if (!type) // enums: access | verify
    type = "access";

  // $beachfront/type/uid/token, last slash is encoded for reasons
  return `${siteUrl}/${type}/${encodeURIComponent(email)}${encodeURIComponent("&#47;")}${token}`;
}
