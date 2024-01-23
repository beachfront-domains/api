# DNSKEY Record

## create

NOTE: `flags` must be passed as a string, to account for a GraphQL limitation.

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
          key
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
    "flags": "257",
    "name": "examplename",
    "key": "UF/T57QzySCMSa4eLIHmylp/DToPlnXqL0XiRPJ6oSU=",
    "type": "DNSKEY"
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
          key
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
    "name": "blog.neuenet",
    "type": "DNSKEY"
  }
}
```

### HTTP Header

```json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
```



<!-- https://www.dynu.com/Resources/DNS-Records/DNSKEY-Record -->
