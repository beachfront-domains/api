


/// import

import jws from "jws";



/// export

export default (jwt, options?) => {
  options = options || {};
  const decoded = jws.decode(jwt, options);

  if (!decoded)
    return null;

  const { header, signature } = decoded;
  let { payload } = decoded;

  /// try to parse the payload
  if (typeof payload === "string") {
    try {
      const obj = JSON.parse(payload);

      if (obj !== null && typeof obj === "object")
        payload = obj;
    } catch(error) {
      /// ignore error
      console.group("JWT payload parse error");
      console.error(error);
      console.groupEnd();
    }
  }

  /// return header if `complete` option is enabled. header includes
  /// claims such as `kid` and `alg` used to select the key within a
  /// JWKS needed to verify the signature

  if (options.complete === true) {
    return {
      header,
      payload,
      signature
    };
  }

  return payload;
};
