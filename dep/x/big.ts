


/// export

// @ts-ignore | TS2305 [ERROR]: Module '"internal:///missing_dependency.d.ts"' has no exported member "Big".
export { Big } from "npm:big.js@6.2.1";

// TODO
// : fork Big.js > Big.ts
//   types should be included in the same module
// : https://github.com/MikeMcl/big.js/blob/master/big.mjs
// : https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/big.js/index.d.ts
