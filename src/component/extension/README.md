# extension



## create extension

Requires `name` parameter. `ascii` parameter can be supplied, but will be automatically generated if omitted.

### Types

- ascii: `String`
- name: `String`

### GraphQL query

```sdl
mutation CreateExtension($variables: ExtensionQueryVariables) {
  createExtension(options: $variables) {
    detail {
      ascii
      collection
      id
      name
      nope
      pair
      premium {
        ascii
        name
      }
      price
      pricePremium
      reserved {
        ascii
        name
      }
    }
  }
}
```



## get extension

Requires either `id` or `name` parameters.

### Types

- id: `String`
- name: `String`

### GraphQL query

```sdl
query GetExtension($params: ExtensionQuery) {
  extension(params: $params) {
    detail {
      id
      name
      pairs
      premium
      registry
      tier
    }
  }
}

# Query Variables

{
  "params": {
    "name": "editor"
  }
}

# HTTP Headers

{
  "Authorization": "Bearer KEY_ID"
}
```

### RethinkDB query

```js
r.db("neuenet").table("extension").filter({ name: "qwerty" })
```



## get extensions

All acccepted parameters are optional: `emoji`, `idn`, `length`, `number`, and `startsWith`.

### Types

- emoji: `Boolean`
- idn: `Boolean`
- length: `Number`
- number: `Boolean`
- startsWith: `String`

### GraphQL query

```sdl
query GetExtensions($pagination: PaginationVariable, $variables: ExtensionsQueryVariables) {
  extensions(pagination: $pagination, options: $variables) {
    pageInfo {
      cursor
      hasNextPage
      hasPreviousPage
    }
    detail {
      ascii
      collection
      id
      name
      nope
      pair
      premium {
        ascii
        name
      }
      price
      pricePremium
      reserved {
        ascii
        name
      }
    }
  }
}
```



## update extension

Parameters for locating extension are `ascii`, `id`, and `name`. Every parameter within an extension can be updated aside from `created`, `id`, and `updated`. Those remaining parameters are: `ascii`, `collection`, `name`, `nope`, `pair`, `premium`, `price`, `pricePremium`, and `reserved`.

### Types
- ascii: `String`
- collection: `[String]`
- id: `String`
- name: `String`
- nope: `[String]`
- pair: `[String]`
- premium: `[{ ascii: String, name: String }]`
- price: `Number`
- pricePremium: `Number`
- reserved: `[{ ascii: String, name: String }]`

### GraphQL query

```sdl
mutation UpdateExtension($changes: ExtensionInput, $variables: ExtensionQueryVariables) {
  updateExtension(changes: $changes, options: $variables) {
    detail {
      ascii
      collection
      id
      name
      nope
      pair
      premium {
        ascii
        name
      }
      price
      pricePremium
      reserved {
        ascii
        name
      }
    }
  }
}
```



## delete extension

Requires extension `id`.

Extension should not be deleted if there are domains and/or contracts assigned to it.

### GraphQL query

```sdl
mutation DeleteExtension($id: ID) {
  deleteExtension(options: { id: $id }) {
    success
  }
}
```
