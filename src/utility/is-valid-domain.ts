


/// util

import { phase1 as tlds } from "src/utility/tlds.ts";

const tldRegex = tlds.sort().join("|");



/// export

export function isValidDomain(domain: string) {
  const domainRegex = new RegExp(`^(?!-)([A-Za-z0-9-\\p{Emoji}]{1,63}(?<!-)\\.?)+(${tldRegex})$`, "u"); /// `u` flag is for Unicode (emoji) support
  return domainRegex.test(domain);
}

export function isValidSLD(sld: string) {
  const sldRegex = new RegExp("^(?!-)([A-Za-z0-9-\\p{Emoji}]{1,63}(?<!-)\\.?)$", "u"); /// `u` flag is for Unicode (emoji) support
  return sldRegex.test(sld);
}
