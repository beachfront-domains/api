


/// import

import jws from "jws";

/// util

import decode from "./decode.ts";
import { timespan } from "./utility.ts";

const HS_ALGS = ["HS256", "HS384", "HS512"];
const PUB_KEY_ALGS = ["RS256", "RS384", "RS512", "ES256", "ES384", "ES512"];
const RSA_KEY_ALGS = ["RS256", "RS384", "RS512"];



/// export

export default (jwtString, secretOrPublicKey, options?, callback?) => {
  let debug = true;

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

  if (options.nonce !== undefined && (typeof options.nonce !== "string" || options.nonce.trim() === "")) {
    debug && console.error("Nonce must be a non-empty string");
    return done(false);
  }

  if (!jwtString) {
    debug && console.error("JWT must be provided");
    return done(false);
  }

  if (typeof jwtString !== "string") {
    debug && console.error("JWT must be a string");
    return done(false);
  }

  const parts = jwtString.split(".");

  if (parts.length !== 3) {
    debug && console.error("JWT malformed");
    return done(false);
  }

  // const clockTimestamp = options.clockTimestamp || Math.floor(Date.now() / 1000);
  const clockTimestamp = Date.now();
  let decodedToken;

  try {
    decodedToken = decode(jwtString, { complete: true });
  } catch(error) {
    debug && console.error("Invalid token");
    return done(false);
  }

  const { header, payload, signature } = decodedToken;
  let getSecret;

  if (typeof secretOrPublicKey === "function") {
    if (!callback) {
      debug && console.error(`"verify" must be called asynchronously if secret/public key is provided as a callback`);
      return done(false);
    }

    getSecret = secretOrPublicKey;
  } else {
    getSecret = (header, secretCallback) => secretCallback(null, secretOrPublicKey);
  }

  return getSecret(header, (err, secretOrPublicKey) => {
    if (err) {
      debug && console.error(`Error in secret/public key callback: ${err.message}`);
      return done(false);
    }

    const hasSignature = parts[2].trim() !== "";

    if (!hasSignature && secretOrPublicKey) {
      debug && console.error("JWT signature is required");
      return done(false);
    }

    if (hasSignature && !secretOrPublicKey) {
      debug && console.error("Missing secret/public key");
      return done(false);
    }

    if (!hasSignature && !options.algorithms)
      options.algorithms = ["none"];

    if (!options.algorithms) {
      options.algorithms = secretOrPublicKey.toString().includes("BEGIN CERTIFICATE") ||
        secretOrPublicKey.toString().includes("BEGIN PUBLIC KEY") ? PUB_KEY_ALGS :
        secretOrPublicKey.toString().includes("BEGIN RSA PUBLIC KEY") ? RSA_KEY_ALGS : HS_ALGS;
    }

    if (!~options.algorithms.indexOf(header.alg)) {
      debug && console.error("Invalid algorithm");
      return done(false);
    }

    let valid;

    try {
      valid = jws.verify(jwtString, header.alg, secretOrPublicKey);
    } catch(error) {
      debug && console.error("Invalid signature");
      return done(false);
    } finally {
      if (!valid) {
        debug && console.error("Invalid signature");
        return done(false);
      }
    }

    if (typeof payload.nbf !== "undefined" && !options.ignoreNotBefore) {
      if (typeof payload.nbf !== "number") {
        debug && console.error(`Invalid "nbf" value`);
        return done(false);
      }

      if (payload.nbf > clockTimestamp + (options.clockTolerance || 0)) {
        debug && console.error("JWT not active", new Date(payload.nbf * 1000));
        return done(false);
      }
    }

    if (typeof payload.exp !== "undefined" && !options.ignoreExpiration) {
      if (typeof payload.exp !== "number") {
        debug && console.error(`Invalid "exp" value`);
        return done(false);
      }

      if (clockTimestamp >= payload.exp + (options.clockTolerance || 0)) {
        debug && console.error("JWT expired", new Date(payload.exp * 1000));
        return done(false);
      }
    }

    if (options.audience) {
      const audiences = Array.isArray(options.audience) ? options.audience : [options.audience];
      const target = Array.isArray(payload.aud) ? payload.aud : [payload.aud];

      const match = target.some(targetAudience => {
        return audiences.some(audience => {
          return audience instanceof RegExp ? audience.test(targetAudience) : audience === targetAudience;
        });
      });

      if (!match) {
        debug && console.error(`JWT "audience" invalid. Expected: ${audiences.join(" or ")}`);
        return done(false);
      }
    }

    if (options.issuer) {
      const invalidIssuer =
        (typeof options.issuer === "string" && payload.iss !== options.issuer) ||
        (Array.isArray(options.issuer) && options.issuer.indexOf(payload.iss) === -1);

      if (invalidIssuer) {
        debug && console.error(`JWT "issuer" invalid. Expected: ${options.issuer}`);
        return done(false);
      }
    }

    if (options.subject) {
      if (payload.sub !== options.subject) {
        debug && console.error(`JWT "subject" invalid. Expected: ${options.subject}`);
        return done(false);
      }
    }

    if (options.jwtid) {
      if (payload.jti !== options.jwtid) {
        debug && console.error(`JWT "jwtid" invalid. Expected: ${options.jwtid}`);
        return done(false);
      }
    }

    if (options.nonce) {
      if (payload.nonce !== options.nonce) {
        debug && console.error(`JWT "nonce" invalid. Expected: ${options.nonce}`);
        return done(false);
      }
    }

    if (options.maxAge) {
      if (typeof payload.iat !== "number") {
        debug && console.error(`"iat" required when "maxAge" is specified`);
        return done(false);
      }

      const maxAgeTimestamp = timespan(options.maxAge, payload.iat);

      if (typeof maxAgeTimestamp === "undefined") {
        debug && console.error(`"maxAge" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60`);
        return done(false);
      }

      if (clockTimestamp >= maxAgeTimestamp + (options.clockTolerance || 0)) {
        debug && console.error(`"maxAge" exceeded ${new Date(maxAgeTimestamp * 1000)}`);
        return done(false);
      }
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
