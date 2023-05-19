


/// import

import Big from "big.js";
import { GraphQLScalarType, Kind } from "graphql";



/// export

export default new GraphQLScalarType({
  name: "Decimal",
  description: "The `Decimal` scalar type to represent currency values",

  serialize(value) {
    return new Big(value);
  },

  parseLiteral(ast: any) {
    if (ast.kind !== Kind.STRING)
      throw new TypeError(`${String(ast.value)} is not a valid decimal value.`);

    return Big(ast.value);
  },

  parseValue(value) {
    if (isNaN(new Big(value)))
      throw new TypeError(`${String(value)} is not a valid decimal value.`);

    return Big(value);
  }
});
