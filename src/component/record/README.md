# record

> TBD



## create record

Requires `name` and `type` parameters. Optional parameters are `class` (`IN` by default) and `ttl` (`300` by default).

### Types

- class?: `String`
- name: `String`
- ttl?: `Number`
- type: `String`

### GraphQL query

```sdl
mutation CreateRecord($params: RecordInput) {
  createRecord(params: $params) {
    detail {
      class
      created
      id
      name
      ttl
      type
      updated
    }
  }
}
```

```json
// Query Variables
// `class` is an optional param with a default value of "IN"

{
  "params": {
    "data": "50.116.9.7",
    "name": "blog.neuenet",
    "type": "AAAA"
  }
}

// CAA / `flags` and `issuerCritical` are optional params with defaults
{
  "params": {
    "name": "blog.neuenet",
    "tag": "issue",
    "type": "CAA",
    "value": "ca.example.net"
  }
}

// DNSKEY
{
  "params": {
    "algorithm": 13,
    "flags": 257,
    "key": "ZhCa3rGLofZcndFN2aVd==",
    "name": "blog.neuenet",
    "type": "DNSKEY"
  }
}

// HTTP Headers

{
  "Authorization": "Bearer YOUR_TOKEN"
}
```

```sdl
mutation CreateRecord($params: RecordInput) {
  createRecord(params: $params) {
    detail {
      algorithm
      class
      created
      flags
      id
      key
      name
      ttl
      type
      updated
    }
  }
}
```

### cURL query

```sh
curl "http://localhost:3000/graphql" \
  --data '{ "query": "mutation CreateRecord($params: RecordInput) { createContract(params: $params) { detail { created expires extension { name tier } id registrar { name url } updated valid }}}", "variables": { "params": { "expires": "2024-07-25T23:37:10.891Z", "extension": "51076b02-933d-4ce6-9372-bcd2cc02c7af", "registrar": "859ad93a-99a7-11ed-afd4-e7705238ff0f" }}}' \
  --header "Authorization: Bearer YOUR_TOKEN"
```



## get record

### Types

- name: `String`
- type: `String`

### GraphQL query

```sdl
query GetRecord($params: RecordQuery) {
  record(params: $params) {
    detail {
      class
      data {
        ... on DataString {
          data
        }
        ... on DataObject {
          flags
          issuerCritical
          tag
          value
        }
      }
      name
      ttl
      type
    }
  }
}
```

```json
// Query Variables

{
  "params": {
    "name": "blog.neuenet",
    "type": "A"
  }
}

// HTTP Headers

{
  "Authorization": "Bearer YOUR_TOKEN"
}
```
