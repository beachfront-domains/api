# SSHFP Record

## dig

```sh
dig @localhost -p 5300 bar.examplename SSHFP
```



## create

`algorithm`, `fingerprint`, `hash`, `name`, and `type` are required variables.

`class` and `ttl` are optional variables with sensible defaults.

### GraphQL query

```sdl
mutation CreateRecord($params: RecordInput) {
  createRecord(params: $params) {
    detail {
      class
      data {
        ... on DataObject {
          algorithm
          fingerprint
          hash
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
    "algorithm": 2,
    "fingerprint": "123456789abcdef67890123456789abcdef67890",
    "hash": 1,
    "name": "bar.examplename",
    "type": "SSHFP"
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
          fingerprint
          hash
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
    "type": "SSHFP"
  }
}
```

### HTTP Header

```json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
```



<!-- https://www.dynu.com/Resources/DNS-Records/SSHFP-Record -->
