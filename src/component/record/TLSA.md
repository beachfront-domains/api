# TLSA Record

## dig

```sh
dig @localhost -p 5300 bar.examplename TLSA
```



## create

`certificate`, `matchingType`, `name`, `selector`, `type`, and `usage` are required variables.

`class` and `ttl` are optional variables with sensible defaults.

### GraphQL query

```sdl
mutation CreateRecord($params: RecordInput) {
  createRecord(params: $params) {
    detail {
      class
      data {
        ... on DataObject {
          certificate
          matchingType
          selector
          usage
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
    "certificate": "2FB604558BE5538D942ED32889A35A0CD0FFC804D4176E5289A853C2 397D4365AAD09C85F316CBE18D9230A4B184F6B7F284DDF41510D0D6 DD8992D45FA8D75D",
    "matchingType": 2,
    "name": "_443._tcp.examplename",
    "selector": 1,
    "ttl": 3600,
    "type": "TLSA",
    "usage": 3
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
          certificate
          matchingType
          selector
          usage
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
    "type": "TLSA"
  }
}
```

### HTTP Header

```json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
```



<!-- https://www.dynu.com/Resources/DNS-Records/TLSA-Record -->
