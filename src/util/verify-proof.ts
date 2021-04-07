


///  I M P O R T

import env from "vne";
import jwt from "jsonwebtoken";



///  E X P O R T

export default (proof: string): boolean => {
  let decoded = false;

  try {
    // TODO
    // : figure out what type the `jwt.verify` repsonse is
    // @ts-ignore TS2322: Type 'string | object' is not assignable to type 'boolean'.
    decoded = jwt.verify(proof, env().key.secret);
  } catch(error) {
    decoded = false;
  }

  return decoded;
};
