# MX Record

## create

`exchange`, `name`, `preference` and `type` are required variables.

### GraphQL query

```sdl
mutation CreateRecord($params: RecordInput) {
  createRecord(params: $params) {
    detail {
      class
      data {
        ... on DataObject {
          exchange
          preference
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
    "exchange": "mx.blog.neuenet",
    "name": "blog.neuenet",
    "preference": 10,
    "type": "MX"
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
          exchange
          preference
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
    "type": "MX"
  }
}
```

### HTTP Header

```json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
```
