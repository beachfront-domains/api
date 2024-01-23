# SOA Record

## dig

```sh
dig @localhost -p 5300 bar.examplename SOA
```



## create

`expire`, `minimum`, `mname`, `name`, `refresh`, `retry`, `rname`, `serial` and `type` are required variables.

`class` and `ttl` are optional variables with sensible defaults.

### GraphQL query

```sdl
mutation CreateRecord($params: RecordInput) {
  createRecord(params: $params) {
    detail {
      class
      data {
        ... on DataObject {
          expire
          minimum
          mname
          refresh
          retry
          rname
          serial
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
    "expire": 604800,
    "minimum": 86400,
    "mname": "ns1.app.beachfront",
    "name": "bar.examplename",
    "refresh": 3600,
    "retry": 1800,
    "rname": "administrator.app.beachfront",
    "serial": 2023092801,
    "type": "SOA"
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
          expire
          minimum
          mname
          refresh
          retry
          rname
          serial
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
    "type": "SOA"
  }
}
```

### HTTP Header

```json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
```



<!-- https://www.dynu.com/Resources/DNS-Records/SOA-Record -->
