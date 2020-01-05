"use strict";



//  I M P O R T S

import { buildSchema } from "graphql";
import graphqlHTTP from "express-graphql";

//  U T I L S

import { isDevelopment, siteName } from "~util/index";
import resolver from "~schema/resolver";
import schema from "~schema/index";

const extensions = (suppliedData: { document: any; variables: any; operationName: any; result: any; context: any}) => {
  const {
    // document,
    // variables,
    // operationName,
    // result,
    context
  } = suppliedData;

  return { // TODO: See if it is possible to add the requestor's information here
    runTime: Date.now() - context.startTime
  };
};



//  E X P O R T

export default (server: any) => {
  // TODO: Add auth
  // Ref: https://github.com/graphql-boilerplates/typescript-graphql-server/blob/master/advanced/src/resolvers/Mutation/auth.ts

  server.get("/",
    graphqlHTTP({
      graphiql: false,
      // TODO: Add `status` function and send health status
      rootValue: {
        hello: () => `Welcome to the GraphQL interface for ${siteName}`
      },
      schema: buildSchema("type Query { hello: String }")
    })
  );

  server.post("/",
    graphqlHTTP({
      graphiql: isDevelopment,
      rootValue: resolver(),
      schema: buildSchema(schema())
    })
  );



  // Check queries only in development
  if (isDevelopment) {
    server.get("/graphql",
      graphqlHTTP({
        context: {
          startTime: Date.now()
        },
        extensions,
        graphiql: true,
        rootValue: {
          hello: () => `Welcome to the GraphQL interface for ${siteName}`
        },
        schema: buildSchema("type Query { hello: String }")
      })
    );

    server.post("/graphql",
      graphqlHTTP({
        context: {
          startTime: Date.now()
        },
        extensions,
        graphiql: true,
        rootValue: resolver(),
        schema: buildSchema(schema())
      })
    );
  }
};
