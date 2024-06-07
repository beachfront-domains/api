# member

> TBD



## create login

Requires `email`  parameter.

### Types

- email: `String`

### GraphQL query

```sdl
mutation CreateLogin($params: LoginInput) {
  createLogin(params: $params) {
    detail {
      for {
        created
        email
        id
        name
        role
        updated
      }
      id
      token
    }
  }
}

# Query Variables

{
  "params": {
    "email": "admin@alien.domains"
  }
}
```

### EdgeDB query

```
```



## get login

`email`, `id` are optional parameters for locating a login, but one of them must be supplied.

### Types

- email: `String`
- id: `String`

### GraphQL query

```sdl
query GetLogin($params: LoginQuery) {
  login(params: $params) {
    detail {
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
      token
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



## delete login

`email`, `id` are optional parameters for locating a login, but one of them must be supplied.

Logins are automatically deleted after they're processed via the initial session function, so you shouldn't need to use this endpoint. Still, it's nice to have.

### Protected Function

Requires an HTTP header with Authorization Bearer Token.

### GraphQL query

```sdl
mutation DeleteLogin($params: LoginQuery) {
  deleteLogin(params: $params) {
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
