


///  I M P O R T

import { customAlphabet } from "nanoid";

///  U T I L

const defaultOptions = {
  alphabet: "ACDEFGHJKMNPQRSTWXYZ1234567890",
  size: 20
};



///  E X P O R T

export default (prefix?: string, options: { alphabet: string; size: number; } = defaultOptions): string => {
  const nanoid = customAlphabet(
    options.alphabet || defaultOptions.alphabet,
    options.size || defaultOptions.size
  );

  if (!prefix)
    return "";

  return `${String(prefix).toUpperCase()}:${nanoid()}`;
};
