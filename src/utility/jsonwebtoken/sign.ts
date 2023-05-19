


/// import

import jws from "jws";

/// util

import { timespan } from "./utility.ts";

const SUPPORTED_ALGS = [
  "ES256",
  "ES384",
  "ES512",
  "HS256",
  "HS384",
  "HS512",
  "none",
  "RS256",
  "RS384",
  "RS512"
];

const optionsForObjects = [
  "audience",
  "expiresIn",
  "issuer",
  "jwtid",
  "notBefore",
  "noTimestamp",
  "subject"
];

const optionsToPayload = {
  "audience": "aud",
  "issuer": "iss",
  "jwtid": "jti",
  "subject": "sub"
};



/// export

export default (payload, secretOrPrivateKey, options?, callback?) => {
  if (typeof options === "function") {
    callback = options;
    options = {};
  } else {
    options = options || {};
  }

  const isObjectPayload = typeof payload === "object" && !Buffer.isBuffer(payload);

  const header = Object.assign({
    alg: options.algorithm || "HS512",
    kid: options.keyid,
    typ: isObjectPayload ? "JWT" : undefined
  }, options.header);

  function failure(error) {
    if (callback)
      return callback(error);

    throw error;
  }

  if (!secretOrPrivateKey && options.algorithm !== "none")
    return failure(new Error("Missing value for secret/private key"));

  if (typeof payload === "undefined") {
    return failure(new Error("Payload is required"));
  } else if (isObjectPayload) {
    try {
      Object.entries(payload).forEach(([key, value]) => {
        switch(key) {
          case "exp":
          case "iat":
          case "nbf":
            if (typeof value !== "number")
              throw new Error(`"${key}" should be a number of seconds`);

          default:
            break;
        }
      });

      // validatePayload(payload); /// ref
    } catch(error) {
      return failure(error);
    }

    if (!options.mutatePayload)
      payload = Object.assign({},payload);
  } else {
    const invalidOptions = optionsForObjects.filter(opt => typeof options[opt] !== "undefined");

    if (invalidOptions.length > 0)
      return failure(new Error(`Invalid ${invalidOptions.join(",")} option for ${(typeof payload )} payload`));
  }

  if (typeof payload.exp !== "undefined" && typeof options.expiresIn !== "undefined")
    return failure(new Error(`Bad "options.expiresIn" option, the payload already has an "exp" property.`));

  if (typeof payload.nbf !== "undefined" && typeof options.notBefore !== "undefined")
    return failure(new Error(`Bad "options.notBefore" option, the payload already has an "nbf" property.`));

  try {
    Object.entries(options).forEach(([key, value]) => {
      switch(key) {
        case "algorithm":
          if (!SUPPORTED_ALGS.includes(String(value)))
            throw new Error(`"${key}" must be a valid string enum value`);
          break;

        case "audience":
          if (typeof value !== "string" || !Array.isArray(value))
            throw new Error(`"${key}" must be a string or array`);
          break;

        case "encoding":
        case "issuer":
        case "jwtid":
        case "keyid":
        case "subject":
          if (typeof value !== "string")
            throw new Error(`"${key}" must be a string`);
          break;

        case "expiresIn":
        case "notBefore":
          if (typeof value !== "string" || !Number.isInteger(value))
            throw new Error(`"${key}" should be a number of seconds or string representing a timespan`);
          break;

        case "header":
          if (typeof value !== "object")
            throw new Error(`"${key}" must be an object`);
          break;

        case "mutatePayload":
        case "noTimestamp":
          if (typeof value !== "boolean")
            throw new Error(`"${key}" must be a boolean`);
          break;

        default:
          break;
      }
    });

    // validateOptions(options); /// ref
  } catch(error) {
    return failure(error);
  }

  const timestamp = payload.iat || Math.floor(Date.now() / 1000);

  if (options.noTimestamp)
    delete payload.iat;
  else if (isObjectPayload)
    payload.iat = timestamp;

  if (typeof options.notBefore !== "undefined") {
    try {
      payload.nbf = timespan(options.notBefore, timestamp);
    } catch(error) {
      return failure(error);
    }

    if (typeof payload.nbf === "undefined")
      return failure(new Error(`"notBefore" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60`));
  }

  if (typeof options.expiresIn !== "undefined" && typeof payload === "object") {
    try {
      payload.exp = timespan(options.expiresIn, timestamp);
    } catch(error) {
      return failure(error);
    }

    if (typeof payload.exp === "undefined")
      return failure(new Error(`"expiresIn" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60`));
  }

  Object.keys(optionsToPayload).forEach(function (key) {
    const claim = optionsToPayload[key];

    if (typeof options[key] !== "undefined") {
      if (typeof payload[claim] !== "undefined")
        return failure(new Error(`Bad "options.${key}" option. Payload already has the "${claim}" property.`));

      payload[claim] = options[key];
    }
  });

  const encoding = options.encoding || "utf8";

  if (typeof callback === "function") {
    let signature;
    // callback = callback && once(callback);

    try {
      signature = jws.createSign({
        encoding,
        header,
        payload,
        privateKey: secretOrPrivateKey
      });
    } catch(error) {
      callback(error);
    } finally {
      callback(null, signature);
    }
  } else {
    return jws.sign({
      encoding,
      header,
      payload,
      secret: secretOrPrivateKey
    });
  }
};
