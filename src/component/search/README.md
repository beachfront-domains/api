# search



Requires `name` parameter.

### Types

- name: `String`

### GraphQL query

```sdl
query DomainSearch($pagination: PaginationOptions, $params: SearchQuery) {
  search(pagination: $pagination, params: $params) {
    detail {
      available
      created
      extension {
        name
        tier
      }
      name
      premium
      priceHNS
      priceUSD
    }
    pageInfo {
      cursor
      hasNextPage
      hasPreviousPage
    }
    viewer {
      id
    }
  }
}

# Query Variables

{
  "params": {
    "name": "design.editor"
  }
}
```
