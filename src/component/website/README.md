# website



## create website

`content`, `domain` and `owner` parameters are required for creating a website.

### Types

- content: `String`
- domain: `String`
- id: `String` (UUID)

### GraphQL Query

```sdl
mutation CreateWebsite($params: WebsiteInput) {
  createWebsite(params: $params) {
    detail {
      content
      created
      id
      domain {
        expiry
        name
        status
      }
      owner {
        id
        name
        username
      }
      updated
    }
  }
}
```

### GraphQL Variables

```json
{
  "params": {
    "content": "# Markdown Code\n\n**And so on...**",
    "domain": "your.examplename",
    "owner": "00000000-0000-0000-0000-000000000000"
  }
}
```

### HTTP Header

Requires an HTTP `Authorization` header with Bearer Token.

```json
{
  "Authorization": "Bearer KEY_ID"
}
```



## get website

Parameters are optional but one is required for locating a website: `domain` or `id`.

### Types

- domain: `String`
- id: `String` (UUID)

### GraphQL Query

```sdl
query GetWebsite($params: WebsiteQuery) {
  website(params: $params) {
    detail {
      content
      created
      id
      domain {
        expiry
        name
        status
      }
      owner {
        id
        name
        username
      }
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
    "domain": "your.examplename"
  }
}
```

### HTTP Header

Requires an HTTP `Authorization` header with Bearer Token.

```json
{
  "Authorization": "Bearer KEY_ID"
}
```



## get websites

Requires `owner` parameter to locate all of their websites.

### Types

- owner: `String` (UUID)

### GraphQL Query

```sdl
query GetWebsites($pagination: PaginationOptions, $params: WebsitesQuery) {
  websites(pagination: $pagination, params: $params) {
    detail {
      content
      created
      id
      domain {
        expiry
        name
        status
      }
      owner {
        id
        name
        username
      }
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
    "owner": "00000000-0000-0000-0000-000000000000"
  }
}
```

### HTTP Header

Requires an HTTP `Authorization` header with Bearer Token.

```json
{
  "Authorization": "Bearer KEY_ID"
}
```



## delete website

Parameters are optional but one is required for locating a website: `domain` or `id`.

### Types

- domain: `String`
- id: `String` (UUID)

### GraphQL Query

```sdl
mutation DeleteWebsite($params: WebsiteQuery) {
  deleteWebsite(params: $params) {
    success
  }
}
```

### GraphQL Variables

```json
{
  "params": {
    "id": "00000000-0000-0000-0000-000000000000"
  }
}
```

### HTTP Header

Requires an HTTP `Authorization` header with Bearer Token.

```json
{
  "Authorization": "Bearer KEY_ID"
}
```



## update website

Parameters are optional but one is required for locating a website: `domain` and `id`.

`content` is a required parameter for updating a website.

### Types

- content: `String`
- domain: `String`
- id: `String` (UUID)

### GraphQL Query

```sdl
mutation UpdateWebsite($params: WebsiteQuery, $updates: WebsiteInput) {
  updateWebsite(params: $params, updates: $updates) {
    detail {
      content
      created
      id
      domain {
        expiry
        name
        status
      }
      owner {
        id
        name
        username
      }
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
    "domain": "your.examplename"
  },
  "updates": {
    "content": "# Markdown Code\n\n**And so on...**"
  }
}
```

### HTTP Header

Requires an HTTP `Authorization` header with Bearer Token.

```json
{
  "Authorization": "Bearer KEY_ID"
}
```
