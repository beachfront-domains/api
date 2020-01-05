


//  U T I L

// import isEnumerableObject from "./is-enumerable-object";



//  E X P O R T

export default (options: object, allowedKeys: string[]) => {
  // Validates options are an enumerable object that conforms to a whitelist of allowed keys.

  // if (!isEnumerableObject(options))
  //   return "options must be an enumerable object."

  const invalid = Object.keys(options).filter(
    option => !allowedKeys.includes(option)
  );

  if (invalid.length)
    return `options invalid: \`${invalid.join("`, `")}\`.`;
};



// via https://github.com/jaydenseric/graphql-api-koa/blob/master/src/checkOptions.mjs
