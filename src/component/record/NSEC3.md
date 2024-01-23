# NSEC3 Record

## dig

```sh
dig @localhost -p 5300 bar.examplename NSEC3
```



## create

`algorithm`, `flags`, `iterations`, `name`, `nextDomain`, `rrtypes`, `salt`, and `type` are required variables.

`class` and `ttl` are optional variables with sensible defaults.

Ideally, you'd use `... on FlagInt` in the GraphQL query but for some reason

### GraphQL query

```sdl
mutation CreateRecord($params: RecordInput) {
  createRecord(params: $params) {
    detail {
      class
      data {
        ... on DataObject {
          algorithm
          flags {
            ... on FlagInt {
              flags
            }
          }
          iterations
          nextDomain
          rrtypes
          salt
        }
      }
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

### Query Variables

```json
{
  "params": {
    "algorithm": 1,
    "flags": 0,
    "iterations": 257,
    "name": "bar.examplename",
    "nextDomain": "foo.examplename",
    "rrtypes": ["DNSKEY", "NSEC3PARAM", "RRSIG"],
    "salt": "74ae486f6ecbbd29010047ad",
    "type": "NSEC3"
  }
}
```

### HTTP Header

```json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
```



## get
### GraphQL query

```sdl
query GetRecord($params: RecordQuery) {
  record(params: $params) {
    detail {
      class
      data {
        ... on DataObject {
          algorithm
          flags {
            ... on FlagInt {
              flags
            }
          }
          iterations
          nextDomain
          rrtypes
          salt
        }
      }
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

### Query Variables

```json
{
  "params": {
    "name": "bar.examplename",
    "type": "NSEC3"
  }
}
```

### HTTP Header

```json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
```
