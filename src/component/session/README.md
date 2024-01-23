# session

> TBD



## create session

Requires `for` and `token` parameters.

`device`, `ip`, and `nickname` are optional parameters.

### Types

- device: `String`
- for: `String`
- ip: `String`
- nickname: `String`
- token: `String` (login token)

### GraphQL query

```sdl
mutation CreateSession($params: SessionInput) {
  createSession(params: $params) {
    detail {
      device
      expires
      for {
        avatar
        created
        email
        id
        name
        role
        updated
      }
      id
      ip
      nickname
      token
    }
  }
}

# Query Variables

{
  "params": {
    "for": "c4b6dd76-bba3-11ed-833c-0bc82a0ce7bb",
    "nickname": "iPhone",
    "token": "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJwYXN0cnkiLCJpYXQiOjE2Nzg2NjQ5NTMsImlzcyI6IlBhc3RyeSBBUEkiLCJuYmYiOjE2Nzg2NjQ5NTMsImV4cCI6MTY3ODY2NTg1Mywic3ViIjoiaWR8YzRiNmRkNzYtYmJhMy0xMWVkLTgzM2MtMGJjODJhMGNlN2JiIn0.Q0UxRkY3QzAyMjE1NTgxQkU1ODQ1NTY0QkU1RDUwQzFFNTU2MDM0NDQ0RDEzMTE2NTk2MThEMzk2Nzg1QTA2MDkwNDJFNDg3RUVDMzBGNkYyQUU4QkFDQTdBNDY1M0RGRjNBQzYzNDA1OTE1NkU5NkFBQzI1NTBFRDhCN0EzMEY"
  }
}
```

### EdgeDB query

```
```



## get session

`id` is required for locating a session.

### Protected Function

Requires an HTTP header with Authorization Bearer Token.

### Types

- id: `String`

### GraphQL query

```sdl
query GetSession($params: SessionQuery) {
  session(params: $params) {
    detail {
      created
      device
      expires
      for {
        avatar
        created
        email
        id
        name
        role
        updated
      }
      id
      ip
      nickname
      token
      updated
    }
  }
}

# Query Variables

{
  "params": {
    "id": "557a220a-3fa3-11ed-b55a-03f5c4cb889f"
  }
}
```

### EdgeDB query

```
```



## get sessions

`for` and `wildcard` are optional parameters for locating sessions, but at least one must be supplied.

If `wildcard` is supplied, two things happen: 1) other parameters are ignored and 2) **all** documents are returned.

NOTE: THIS SHOULD BE SCOPED TO THE LOGGED-IN MEMBER UNLESS ADMIN

`$pagination` is optional.

### Protected Function

Requires an HTTP header with Authorization Bearer Token.

### Types

- for: `String` (member ID)
- wildcard: `String` (use `*` for value)

### GraphQL query

```sdl
query GetSessions($params: SessionsQuery, $pagination: PaginationOptions) {
  sessions(params: $params, pagination: $pagination) {
    detail {
      created
      device
      expires
      for {
        avatar
        created
        email
        id
        name
        role
        updated
      }
      id
      ip
      nickname
      token
      updated
    }
    pageInfo {
      cursor
      hasNextPage
      hasPreviousPage
    }
  }
}

# Query Variables

{
  "pagination": {
    "after": "ZjVmZmEwMjUtZjY3MS00OGM0LWE4YzEtNWZkNTZjYjQ1MGY1",
    "first": 4
  },
  "params": {
    "for": "557a220a-3fa3-11ed-b55a-03f5c4cb889f"
  }
}
```

### EdgeDB query

```
```



## update session

`id` is required for locating a session.

`expires` expects the result of `new Date(...).toString()`.

### Protected Function

Requires an HTTP header with Authorization Bearer Token.

### Types

- expires: `String`
- nickname: `String`

### GraphQL query

```sdl
mutation UpdateSession($params: SessionQuery, $updates: SessionInput) {
  updateSession(params: $params, updates: $updates) {
    detail {
      created
      device
      expires
      for {
        avatar
        created
        email
        id
        name
        role
        updated
      }
      id
      ip
      nickname
      token
      updated
    }
  }
}

# Query Variables

{
  "params": {
    "id": "e31d307c-b869-11ed-ae11-1bb9a1b77917"
  },
  "updates": {
    "expires": "Mon Mar 27 2023 06:22:00 GMT-0700 (Pacific Daylight Time)"
  }
}
```

### EdgeDB query

```
```



## delete session

`id` is required for locating a session.

### Protected Function

Requires an HTTP header with Authorization Bearer Token.

### GraphQL query

```sdl
mutation DeleteSession($params: SessionQuery) {
  deleteSession(params: $params) {
    success
  }
}

# Query Variables

{
  "params": {
    "id": "be19c7e4-b86a-11ed-8926-bb776cfe072c"
  }
}
```

### EdgeDB query

```
```
