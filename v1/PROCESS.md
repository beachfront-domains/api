# process

When creating a new service:
- create schema in `/schema`
- create types and interfaces in `/src/schema`
- import/export types in `/src/schema/index.ts`
- create CRUD operations in `/src/service`
  - order: read, create, update, delete
- import/export CRUD operations in `/src/schema/resolver.ts`
- add table to `preFlightChecks()` in `/src/index.ts`
- create GraphQL queries and mutations in `schema.schema.graphql`
- NOTE: a restart of the server may be required to pick up new GraphQL schema
