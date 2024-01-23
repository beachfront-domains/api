# HINFO Record

## create

`cpu`, `name`, `os` and `type` are required variables.

### GraphQL query

```sdl
mutation CreateRecord($params: RecordInput) {
  createRecord(params: $params) {
    detail {
      class
      data {
        ... on DataObject {
          cpu
          os
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
    "cpu": "Apple M5 Ultra",
    "os": "hikari",
    "name": "blog.neuenet",
    "type": "HINFO"
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
          cpu
          os
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
    "type": "HINFO"
  }
}
```

### HTTP Header

```json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
```
