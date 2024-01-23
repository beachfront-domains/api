# RRSIG Record

## dig

```sh
dig @localhost -p 5300 bar.examplename RRSIG
```



## create

`algorithm`, `expiration`, `inception`, `keyTag`, `labels`, `name`, `originalTTL`, `signature`, `signersName`, `type`, and `typeCovered` are required variables.

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
          expiration
          inception
          keyTag
          labels
          originalTTL
          signature
          signersName
          typeCovered
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
    "algorithm": 15,
    "expiration": 20241030063419,
    "inception": 20231030063419,
    "keyTag": 34243,
    "labels": 1,
    "name": "examplename",
    "originalTTL": 172800,
    "signature": "yI+6+m9QJc7PdSps1tLMYTzQf2WKHUKUPl8ZCfEvqiohILn6s9e+Fbj6 eQ/1Xq2CL4H+ZcSukMA7Aaz3kv95AA==",
    "signersName": "examplename",
    "ttl": 172800,
    "type": "RRSIG",
    "typeCovered": "RRSIG"
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
          expiration
          inception
          keyTag
          labels
          originalTTL
          signature
          signersName
          typeCovered
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
    "type": "RRSIG"
  }
}
```

### HTTP Header

```json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
```
