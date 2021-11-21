# session

## create session

Requires `email` parameter. Remaining permitted parameters are optional: `loginMethod`, `name`, `role`, `staff`, `timezone`, and `username`. Defaults will be automatically created if not supplied.

### Data Explorer query

```js
r
  .db("beachfront")
  .table("session")
  .insert({
    created: new Date(),
    // ...
    updated: new Date()
  })
```

### GraphQL query



## get session

All acccepted parameters are optional: `email`, `id`, and `username`.

### Data Explorer query

```js
r
  .db("beachfront")
  .table("session")
  .get("21ec1045-7510-4a46-b469-ee8203dc0f59")
```

### GraphQL query



## get sessions

### Data Explorer query

```js
r
  .db("beachfront")
  .table("session")
  .filter({ role: "session" })
```

### GraphQL query



## update session
### Data Explorer query
### GraphQL query



## delete session
### Data Explorer query
### GraphQL query



## update session

### Data Explorer query

```js
r
  .db("beachfront")
  .table("session")
  .get("21ec1045-7510-4a46-b469-ee8203dc0f59")
  .update({ role: "session" })
```

### GraphQL query
