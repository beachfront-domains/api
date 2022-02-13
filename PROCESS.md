# process

When creating a new service:
- create schema in `/schema`
- create CRUD operations in `/src/service`
- create types and interfaces in `/src/schema`
- import/export types in `/src/schema/index.ts`
- import/export CRUD operations in `/src/schema/resolver.ts`
- add table to `preFlightChecks()` in `/src/index.ts`
- NOTE: a restart of the server may be required to pick up new GraphQL schema
