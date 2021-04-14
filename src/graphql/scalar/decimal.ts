


///  I M P O R T

import Big from "big.js";
import { GraphQLScalarType, Kind } from "graphql";



///  E X P O R T

export default new GraphQLScalarType({
  name: "Decimal",
  description: "The `Decimal` scalar type to represent currency values",

  serialize(value) {
    return new Big(value);
    // x = new Big(255.5)
    // x.toExponential(5)                     // "2.55500e+2"
    // x.toFixed(5)                           // "255.50000"
    // x.toPrecision(5)                       // "255.50"
  },

  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      // @ts-ignore | TS2339: Property 'value' does not exist on type 'VariableNode | IntValueNode | FloatValueNode | BooleanValueNode | NullValueNode | EnumValueNode | ListValueNode | ObjectValueNode'.
      throw new TypeError(`${String(ast.value)} is not a valid decimal value.`);
    }

    return Big(ast.value);
  },

  parseValue(value) {
    // if (isNaN(new Big(value)))
    //   throw new TypeError(`${String(value)} is not a valid decimal value.`);

    return Big(value);
  }
});
