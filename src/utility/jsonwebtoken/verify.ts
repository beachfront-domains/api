


///  I M P O R T

import jws from "jws";

///  U T I L

import decode from "./decode";
import { timespan } from "./utility";

const PUB_KEY_ALGS = ["RS256", "RS384", "RS512", "ES256", "ES384", "ES512"];
const RSA_KEY_ALGS = ["RS256", "RS384", "RS512"];
const HS_ALGS = ["HS256", "HS384", "HS512"];



///  E X P O R T

export default (jwtString, secretOrPublicKey, options?, callback?) => {
  if ((typeof options === "function") && !callback) {
    callback = options;
    options = {};
  }

  if (!options)
    options = {};

  /// clone this object since we are going to mutate it
  options = Object.assign({}, options);

  let done;

  if (callback) {
    done = callback;
  } else {
    done = (err, data) => {
      if (err)
        throw err;

      return data;
    };
  }

  if (options.clockTimestamp && typeof options.clockTimestamp !== "number")
    return done(console.error(`"clockTimestamp" must be a number`));

  if (options.nonce !== undefined && (typeof options.nonce !== "string" || options.nonce.trim() === ""))
    return done(console.error("Nonce must be a non-empty string"));

  if (!jwtString)
    return done(console.error("JWT must be provided"));

  if (typeof jwtString !== "string")
    return done(console.error("JWT must be a string"));

  const parts = jwtString.split(".");

  if (parts.length !== 3)
    return done(console.error("JWT malformed"));

  const clockTimestamp = options.clockTimestamp || Math.floor(Date.now() / 1000);
  let decodedToken;

  try {
    decodedToken = decode(jwtString, { complete: true });
  } catch(error) {
    return done(console.error("Invalid token"));
  }

  const { header, payload, signature } = decodedToken;
  let getSecret;

  if (typeof secretOrPublicKey === "function") {
    if (!callback)
      return done(console.error(`"verify" must be called asynchronously if secret/public key is provided as a callback`));

    getSecret = secretOrPublicKey;
  } else {
    getSecret = (header, secretCallback) => secretCallback(null, secretOrPublicKey);
  }

  return getSecret(header, (err, secretOrPublicKey) => {
    if (err)
      return done(console.error(`Error in secret/public key callback: ${err.message}`));

    const hasSignature = parts[2].trim() !== "";

    if (!hasSignature && secretOrPublicKey)
      return done(console.error("JWT signature is required"));

    if (hasSignature && !secretOrPublicKey)
      return done(console.error("Missing secret/public key"));

    if (!hasSignature && !options.algorithms)
      options.algorithms = ["none"];

    if (!options.algorithms) {
      options.algorithms = secretOrPublicKey.toString().includes("BEGIN CERTIFICATE") ||
        secretOrPublicKey.toString().includes("BEGIN PUBLIC KEY") ? PUB_KEY_ALGS :
        secretOrPublicKey.toString().includes("BEGIN RSA PUBLIC KEY") ? RSA_KEY_ALGS : HS_ALGS;
    }

    if (!~options.algorithms.indexOf(header.alg))
      return done(console.error("Invalid algorithm"));

    let valid;

    try {
      valid = jws.verify(jwtString, header.alg, secretOrPublicKey);
    } catch(error) {
      return done(console.error("Invalid signature"));
    } finally {
      if (!valid)
        return done(console.error("Invalid signature"));
    }

    if (typeof payload.nbf !== "undefined" && !options.ignoreNotBefore) {
      if (typeof payload.nbf !== "number")
        return done(console.error(`Invalid "nbf" value`));

      if (payload.nbf > clockTimestamp + (options.clockTolerance || 0))
        return done(console.error("JWT not active", new Date(payload.nbf * 1000)));
    }

    if (typeof payload.exp !== "undefined" && !options.ignoreExpiration) {
      if (typeof payload.exp !== "number")
        return done(console.error(`Invalid "exp" value`));

      if (clockTimestamp >= payload.exp + (options.clockTolerance || 0))
        return done(console.error("JWT expired", new Date(payload.exp * 1000)));
    }

    if (options.audience) {
      const audiences = Array.isArray(options.audience) ? options.audience : [options.audience];
      const target = Array.isArray(payload.aud) ? payload.aud : [payload.aud];

      const match = target.some(targetAudience => {
        return audiences.some(audience => {
          return audience instanceof RegExp ? audience.test(targetAudience) : audience === targetAudience;
        });
      });

      if (!match)
        return done(console.error(`JWT "audience" invalid. Expected: ${audiences.join(" or ")}`));
    }

    if (options.issuer) {
      const invalidIssuer =
        (typeof options.issuer === "string" && payload.iss !== options.issuer) ||
        (Array.isArray(options.issuer) && options.issuer.indexOf(payload.iss) === -1);

      if (invalidIssuer)
        return done(console.error(`JWT "issuer" invalid. Expected: ${options.issuer}`));
    }

    if (options.subject) {
      if (payload.sub !== options.subject)
        return done(console.error(`JWT "subject" invalid. Expected: ${options.subject}`));
    }

    if (options.jwtid) {
      if (payload.jti !== options.jwtid)
        return done(console.error(`JWT "jwtid" invalid. Expected: ${options.jwtid}`));
    }

    if (options.nonce) {
      if (payload.nonce !== options.nonce)
        return done(console.error(`JWT "nonce" invalid. Expected: ${options.nonce}`));
    }

    if (options.maxAge) {
      if (typeof payload.iat !== "number")
        return done(console.error(`"iat" required when "maxAge" is specified`));

      const maxAgeTimestamp = timespan(options.maxAge, payload.iat);

      if (typeof maxAgeTimestamp === "undefined")
        return done(console.error(`"maxAge" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60`));

      if (clockTimestamp >= maxAgeTimestamp + (options.clockTolerance || 0))
        return done(console.error(`"maxAge" exceeded ${new Date(maxAgeTimestamp * 1000)}`));
    }

    if (options.complete === true) {
      return done(null, {
        header,
        payload,
        signature
      });
    }

    return done(null, payload);
  });
};
