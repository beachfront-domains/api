# bag

## create bag
### GraphQL query

```esdl
mutation CreateBag($params: BagInput) {
  createBag(params: $params) {
    detail {
      bag {
        duration
        name
        price
      }
      created
      currency
      customer {
        name
        username
      }
      id
      updated
    }
  }
}

# Query Variables

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



## get bag
### GraphQL query

```esdl
query GetBag($params: BagQuery) {
  bag(params: $params) {
    detail {
      bag {
        duration
        name
        price
      }
      created
      currency
      customer {
        name
        username
      }
      id
      updated
    }
  }
}
```

```json
// Query Variables

{
  "params": {
    "id": "a8b32f66-b347-11ee-b7d8-3f26b0a774f4"
  }
}
```



## get bags
### GraphQL query

TBD



## update bag
### GraphQL query

```sdl
mutation UpdateBag($params: BagQuery, $updates: BagInput) {
  updateBag(params: $params, updates: $updates) {
    detail {
      bag {
        duration
        name
        price
      }
      created
      currency
      customer {
        name
        username
      }
      id
      updated
    }
  }
}
```

```json
// Query Variables

{
  "params": {
    "id": "a8b32f66-b347-11ee-b7d8-3f26b0a774f4"
  },
  "updates": {
    "customer": "6af22368-af27-11ee-924e-bffc13bbb644"
  }
}
```



## delete bag

Requires bag `id`.

### GraphQL query

```esdl
mutation DeleteBag($id: ID) {
  deleteBag(params: { id: $id }) {
    success
  }
}
```

```json
// Query Variables

{
  "params": {
    "id": "a8b32f66-b347-11ee-b7d8-3f26b0a774f4"
  }
}
```
