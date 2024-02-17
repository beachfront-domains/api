# order



## create order

Requires `bag`, `customer`, and `vendor` parameters.

`currency` parameter can be supplied, but will be automatically generated if omitted.

### Types

- bag: `Array<BagItemInput>`
  - duration: `Int`
  - name: `String`
  - price: `String`
- bag: `ID`
- customer: `ID`
- vendor: `PaymentVendorInput`
  - `id`: `ID`
  - `name`: `OPENNODE` | `SQUARE` | `STRIPE`

### GraphQL Query

```sdl
mutation CreateOrder($params: OrderInput) {
  createOrder(params: $params) {
    detail {
      bag {
        duration
        name
        price
      }
      currency
      customer {
        id
        username
      }
      id
      number
      paid
      promo
      total
      vendor {
        id
        name
      }
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
    "bag": [
      {
        "duration": 2,
        "name": "hi.freq",
        "price": "630.00"
      },
      {
        "duration": 2,
        "name": "bndl.dist",
        "price": "21.00"
      },
      {
        "duration": 2,
        "name": "bundle.dist",
        "price": "27.30"
      }
    ],
    "currency": "USD",
    "customer": "fe37e236-0d31-11ee-a334-e37844dad469"
  }
}
```

### Authorization Header

```json
{
  "Authorization": "Bearer SESSION_TOKEN"
}
```



## get order

Requires `id` parameter.

### Types

- id: `String`

### GraphQL Query

```sdl
query GetOrder($params: OrderQuery) {
  order(params: $params) {
    detail {
      bag {
        duration
        name
        price
      }
      currency
      customer {
        id
        username
      }
      id
      number
      paid
      promo
      total
      vendor {
        id
        name
      }
    }
  }
}
```

### GraphQL Variables

```json
{
  "params": {
    "name": "editor"
  }
}
```

### Authorization Header

```json
{
  "Authorization": "Bearer KEY_ID"
}
```



## get orders

All acccepted parameters are optional: `created`, `customer`, and `updated`.

### Types

- created: `Date`
- customer: `String`
- updated: `Date`

### GraphQL Query

```sdl
query GetOrders($pagination: PaginationVariable, $params: OrdersQuery) {
  orders(pagination: $pagination, params: $params) {
    detail {
      bag {
        duration
        name
        price
      }
      currency
      customer {
        id
        username
      }
      id
      number
      paid
      promo
      total
      vendor {
        id
        name
      }
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



## update order

Requires `id` parameter to locate an order.

Updatable parameters are `currency`, `paid`, and `promo`.

### Types

- currency: `String`
- paid: `Number`
- promo: `String`

### GraphQL Query

```sdl
mutation UpdateOrder($params: ExtensionQueryVariables, $updates: ExtensionInput) {
  updateOrder(params: $params, updates: $updates) {
    detail {
      bag {
        duration
        name
        price
      }
      currency
      customer {
        id
        username
      }
      id
      number
      paid
      promo
      total
      vendor {
        id
        name
      }
    }
  }
}
```

### GraphQL Variables

```json
{
  "params": {
    "id": "fe37e236-0d31-11ee-a334-e37844dad469"
  },
  "updates": {
    "currency": "USD",
    "paid": 1,
    "promo": "BCHFRNT_LAUNCH"
  }
}
```

### Authorization Header

```json
{
  "Authorization": "Bearer KEY_ID"
}
```



## delete order

Requires `id` parameter.

Extension should not be deleted if there are domains and/or contracts assigned to it.

### Types

- id: `String`

### GraphQL Query

```sdl
mutation DeleteOrder($id: ID) {
  deleteOrder(params: { id: $id }) {
    success
  }
}
```

### GraphQL Variables

```json
{
  "params": {
    "id": "fe37e236-0d31-11ee-a334-e37844dad469"
  }
}
```

### Authorization Header

```json
{
  "Authorization": "Bearer KEY_ID"
}
```
