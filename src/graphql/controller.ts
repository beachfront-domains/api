


///  N A T I V E

import { join } from "path";
import process from "process";

///  I M P O R T

import { buildSchema, graphql } from "graphql";
import { Context } from "@curveball/core";
import Controller from "@curveball/controller";

///  U T I L

import { graphqlHTTP } from "./module/index";
import { environment, LooseObjectInterface, siteName } from "~util/index";
import resolvers from "~schema/resolver";
import schema from "~schema/index";

const isDevelopment = environment === "development";

// @ts-ignore
// const extensions = ({ document, variables, operationName, result, context }) => { // eslint-disable-line no-unused-vars
//   return { // TODO: See if it is possible to add the requestor's information here
//     runTime: Date.now() - context.startTime
//   };
// };



///  P R O G R A M

class GraphQLController extends Controller {
  get(ctx: Context) {
    // request / response / state.params
    ctx.response.headers.set("Server", "beachfront");
    ctx.response.status = 405;
    ctx.response.type = "application/json";

    ctx.response.body = {
      detail: "Please visit our documentation for information on how to use the beachfront api.",
      title: "Method Not Allowed",
      url: "https://beachfront.network/help/developer"
    }

    // ctx.response.status = 200;
    // ctx.response.type = "text/html";
    // ctx.response.body = `<h1>Hello world</h1>`;
    // unpkg.com/svelte@3.24.1/compiler.js
    // unpkg.com/svelte@3.24.1/index.js
    // unpkg.com/svelte@3.24.1/register.js
  }

  async post(ctx: Context) {
    // request / response / state.params
    ctx.response.headers.set("Server", "beachfront");
    ctx.response.type = "application/json";

    let suppliedOperationName: string = "";
    let suppliedQuery: string = "";
    let suppliedVariables: LooseObjectInterface = {};

    if (ctx.request && ctx.request.body) {
      // @ts-ignore > TS2339: properties do not exist on type "unknown".
      const { operationName, query, variables } = ctx.request.body;

      suppliedOperationName = operationName;
      suppliedQuery = query;
      suppliedVariables = variables;
    }

    // console.log("— operation");
    // console.log(suppliedOperationName);
    // console.log("— query");
    // console.log(suppliedQuery);
    // console.log("— variables");
    // console.log(suppliedVariables);

    try {
      const response = await graphql(
        // * schema:
        // *    The GraphQL type system to use when validating and executing a query.
        buildSchema(schema()),

        // * source:
        // *    A GraphQL language formatted string representing the requested operation.
        suppliedQuery,

        // * rootValue:
        // *    The value provided as the first argument to resolver functions on the top
        // *    level type (e.g. the query object type).
        resolvers,

        // * contextValue:
        // *    The context value is provided as an argument to resolver functions after
        // *    field arguments. It is used to pass shared information useful at any point
        // *    during executing this query, for example the currently logged in customer and
        // *    connections to databases or other services.
        {},

        // * variableValues:
        // *    A mapping of variable name to runtime value to use for all variables
        // *    defined in the requestString.
        suppliedVariables,

        // * operationName:
        // *    The name of the operation to use if requestString contains multiple
        // *    possible operations. Can be omitted if requestString contains only
        // *    one operation.
        suppliedOperationName

        // * fieldResolver:
        // *    A resolver function to use when one is not provided by the schema.
        // *    If not provided, the default field resolver is used (which looks for a
        // *    value or method on the source value with the field's name).
        // {},

        // * typeResolver:
        // *    A type resolver function to use when none is provided by the schema.
        // *    If not provided, the default type resolver is used (which looks for a
        // *    `__typename` field or alternatively calls the `isTypeOf` method).
        // {}
      );

      const { data, errors } = response;

      // console.log(data);
      // console.log(errors);

      // console.log("\n—— DATA");
      // console.log("\n|||||——\n");
      // console.log("— operation name —", suppliedOperationName);
      // console.log("\n— query —");
      // console.log(suppliedQuery);
      // console.log("\n— variables —");
      // console.log(suppliedVariables);
      // console.log("\n|||||——\n");
      // console.log("—— DATA\n");
      // console.log(data);
      // console.log("—— RESPONSE\n");
      // console.log(response);

      if (errors) {
        // console.log(errors);
        ctx.response.status = 400;
        ctx.response.body = {
          error: String(errors).replace("Error: ", "")
        };
      } else if (data) {
        ctx.response.status = 200;
        ctx.response.body = data;
      } else {
        ctx.response.status = 204;
        ctx.response.body = {};
      }

      // TODO
      // : Pipe response data into GraphiQL viewer
    } catch(error) {
      ctx.response.status = 400; // should this be 500?
      ctx.response.body = {
        error: String(error).replace("Error: ", "")
      };
    }
  }
}



///  E X P O R T

export default new GraphQLController();
