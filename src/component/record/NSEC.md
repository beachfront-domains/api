# NSEC Record

> The NSEC RR SHOULD have the same TTL value as the SOA minimum TTL field. This is in the spirit of negative caching ([RFC2308]).
> — https://www.rfc-editor.org/rfc/rfc4034.txt

## dig

```sh
dig @localhost -p 5300 bar.examplename NSEC
```



## create

`name`, `nextDomain`, `rrtypes`, and `type` are required variables.

`class` and `ttl` are optional variables with sensible defaults.

### GraphQL query

```sdl
mutation CreateRecord($params: RecordInput) {
  createRecord(params: $params) {
    detail {
      class
      data {
        ... on DataObject {
          nextDomain
          rrtypes
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
    "nextDomain": "foo.examplename",
    "rrtypes": ["A", "CAA", "DLV", "DNSKEY"],
    "type": "NSEC"
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
          nextDomain
          rrtypes
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
