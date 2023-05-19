# session

## create session

Requires `cart` parameter (expects an array of domain names) and optionally a `customer` (expects the customer's ID) parameter.

### Data Explorer query

Remember to supply `created` and `updated` parameters if you're using the Data Explorer.

```js
r
  .db("beachfront")
  .table("session")
  .insert({
    cart: [
      "cool.dist",
      "new.dist",
      "offline.undernet",
      "the.undernet"
    ],
    created: new Date(),
    updated: new Date()
  })
```

### GraphQL query

```sdl
mutation CreateSession($variables: SessionInput) {
  createSession(options: $variables) {
    detail {
      cart
      created
      customer {
        name
        username
      }
      id
      updated
    }
  }
}

{
  variables: {
    cart: [
      "bass.undernet",
      "forte.undernet",
      "my.undernet",
      "serenade.undernet",
      "yamato.undernet"
    ]
  }
}
```



## get session

Requires an `id` parameter.

### Data Explorer query

```js
r
  .db("beachfront")
  .table("session")
  .get("43ed9b9b-e36a-42bc-970b-4545ff66c2cf")
```

### GraphQL query

```sdl
query GetSession($variables: SessionQuery) {
  session(options: $variables) {
    detail {
      cart
      created
      customer {
        name
        username
      }
      id
      updated
    }
  }
}

{
  variables: {
    id: "43ed9b9b-e36a-42bc-970b-4545ff66c2cf"
  }
}
```



## get sessions

### Data Explorer query

```js
r
  .db("beachfront")
  .table("session")
  .filter({ role: "session" })
```

### GraphQL query

TBD



## update session
### Data Explorer query

```js
r
  .db("beachfront")
  .table("session")
  .get("43ed9b9b-e36a-42bc-970b-4545ff66c2cf")
  .update({
    cart: [
      "roll.dist",
      "mega.undernet",
      "roll.undernet"
    ]
  })
```

### GraphQL query

```sdl
mutation UpdateSession($changes: SessionInput, $variables: SessionQuery) {
  updateSession(changes: $changes, options: $variables) {
    detail {
      cart
      created
      customer {
        name
        username
      }
      id
      updated
    }
  }
}

{
  changes: {
    cart: [
      "bass.undernet",
      "forte.undernet",
      "my.undernet",
      "serenade.undernet",
      "yamato.undernet"
    ]
  },
  variables: {
    id: "43ed9b9b-e36a-42bc-970b-4545ff66c2cf"
  }
}
```



## delete session

Requires session `id`.

### Data Explorer query

```js
r
  .db("beachfront")
  .table("session")
  .get("43ed9b9b-e36a-42bc-970b-4545ff66c2cf")
  .delete()
```

### GraphQL query

```sdl
mutation DeleteSession($id: ID) {
  deleteSession(options: { id: $id }) {
    success
  }
}

{
  id: "43ed9b9b-e36a-42bc-970b-4545ff66c2cf"
}
```
