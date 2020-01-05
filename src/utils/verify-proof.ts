


//  I M P O R T S

import env from "vne";
import jwt from "jsonwebtoken";



//  E X P O R T

export default (proof: string) => { // Verify token
  let decoded = false;

  try {
    decoded = jwt.verify(proof, env.key.secret);
  } catch(error) {
    decoded = false;
  }

  return decoded;
};
