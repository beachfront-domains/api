# TXT Record

## dig

```sh
dig @localhost -p 5300 bar.examplename TXT
```



## create

`data`, `name`, and `type` are required variables.

`class` and `ttl` are optional variables with sensible defaults.

### GraphQL query

```sdl
mutation CreateRecord($params: RecordInput) {
  createRecord(params: $params) {
    detail {
      class
      data {
        ... on DataString {
          data
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
    "data": "Random data because, why not?",
    "name": "bar.examplename",
    "type": "TXT"
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
        ... on DataString {
          data
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
    "type": "TXT"
  }
}
```

### HTTP Header

```json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
```



<!-- https://www.dynu.com/Resources/DNS-Records/TXT-Record -->
