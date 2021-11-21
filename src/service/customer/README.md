# customer

## create customer

Requires `email` parameter. Remaining permitted parameters are optional: `loginMethod`, `name`, `role`, `staff`, `timezone`, and `username`. Defaults will be automatically created if not supplied.

### Data Explorer query

```js
r
  .db("beachfront")
  .table("customer")
  .insert({
    created: new Date(),
    email: "you@domain.extension",
    loginMethod: "link",
    name: "Your Name",
    role: "admin",
    staff: true,
    timezone: "GMT-06:00",
    updated: new Date(),
    username: "your_username",
    verified: true
  })
```

### GraphQL query



## get customer

All acccepted parameters are optional: `email`, `id`, and `username`.

### Data Explorer query

```js
r
  .db("beachfront")
  .table("customer")
  .get("21ec1045-7510-4a46-b469-ee8203dc0f59")
```

### GraphQL query



## get customers

### Data Explorer query

```js
r
  .db("beachfront")
  .table("customer")
  .filter({ role: "customer" })
```

### GraphQL query



## update customer
### Data Explorer query
### GraphQL query



## delete customer
### Data Explorer query
### GraphQL query



## update customer

### Data Explorer query

```js
r
  .db("beachfront")
  .table("customer")
  .get("21ec1045-7510-4a46-b469-ee8203dc0f59")
  .update({ role: "customer" })
```

### GraphQL query
