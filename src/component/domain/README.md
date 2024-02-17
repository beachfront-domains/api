# domain

## create domain

TBD



## get domain

TBD



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
