# NAPTR Record

## create

`flags`, `name`, `order`, `preference`, `regexp`, `replacement`, `services` and `type` are required variables.

### GraphQL query

```sdl
mutation CreateRecord($params: RecordInput) {
  createRecord(params: $params) {
    detail {
      class
      data {
        ... on DataObject {
          flags {
            ... on FlagString {
              flags
            }
          }
          order
          preference
          regexp
          replacement
          services
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
    "flags": "U",
    "name": "blog.neuenet",
    "order": 100,
    "preference": 10,
    "regexp": "!^.*$!sip:service@example.com!",
    "replacement": ".",
    "services": "E2U+sip",
    "type": "NAPTR"
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
          flags {
            ... on FlagString {
              flags
            }
          }
          order
          preference
          regexp
          replacement
          services
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
    "type": "NAPTR"
  }
}
```

### HTTP Header

```json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
```



<!-- https://www.dynu.com/Resources/DNS-Records/NAPTR-Record -->
