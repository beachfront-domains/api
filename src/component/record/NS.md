# NS Record

## dig

```sh
dig @localhost -p 5300 bar.examplename NS
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
    "data": "ns.examplename",
    "name": "examplename",
    "ttl": 604800,
    "type": "NS"
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
    "name": "examplename",
    "type": "NS"
  }
}
```

### HTTP Header

```json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
```



<!-- https://www.dynu.com/Resources/DNS-Records/NS-Record -->
