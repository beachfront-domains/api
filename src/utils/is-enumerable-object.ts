


//  E X P O R T

export default (value: any) => {
  return typeof value === "object" &&
    value !== null &&
    !Array.isArray(value);
};



// via https://github.com/jaydenseric/graphql-api-koa/blob/master/src/isEnumerableObject.mjs
