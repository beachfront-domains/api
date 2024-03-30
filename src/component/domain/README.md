# domain

## create domain

TBD



## get domain

All acccepted parameters are optional: `id` and `name`.

### Types

- id: `String`
- name: `String`

```sdl
query GetDomain($params: DomainQuery) {
  domain(params: $params) {
    detail {
      created
      expiry
      extension {
        id
        name
      }
      id
      name
      owner {
        id
        name
        username
      }
      record {
        name
        records
        ttl
        type
      }
      status
      updated
    }
    error {
      code
      message
    }
  }
}
```

### GraphQL Variables

```json
{
  "params": {
    "name": "get.lynk"
  }
}
```

### Authorization Header

```json
{
  "Authorization": "Bearer KEY_ID"
}
```



## get domains

All acccepted parameters are optional: `extension` and `owner`.

### Types

- extension: `String`
- owner: `String`

### GraphQL Query

```sdl
query GetDomains($pagination: PaginationVariable, $params: DomainsQuery) {
  domains(pagination: $pagination, params: $params) {
    detail {
      created
      expiry
      extension {
        id
        name
      }
      id
      name
      owner {
        id
        name
        username
      }
      status
      updated
    }
    error {
      code
      message
    }
    pageInfo {
      cursor
      hasNextPage
      hasPreviousPage
    }
  }
}
```

### GraphQL Variables

```json
{
  "params": {
    "customer": "fe37e236-0d31-11ee-a334-e37844dad469"
  }
}
```

### Authorization Header

```json
{
  "Authorization": "Bearer KEY_ID"
}
```



## update domain

TBD



## delete domain

TBD



## update domain

All acccepted parameters are optional: `id` and `name`.

### Types

- id: `String`
- name: `String`

```sdl
mutation UpdateDomain($params: DomainQuery, $updates: DomainInput) {
  updateDomain(params: $params, updates: $updates) {
    detail {
      created
      expiry
      extension {
        id
        name
        tier
      }
      id
      name
      owner {
        id
        name
        username
      }
      record {
        name
        records
        ttl
        type
      }
      status
      updated
    }
    error {
      code
      message
    }
  }
}

```

### GraphQL Variables

```json
{
  "params": {
    "name": "get.lynk"
    // add `type` here to indicate update?
  },
  "updates": {
    "record": [{
      "name": "meta.webscape",
      "ttl": 200,
      "type": "A"
    }]
  }
}
```

### Authorization Header

```json
{
  "Authorization": "Bearer KEY_ID"
}
```
