# TODO
- add queries here


## Get customers

```js
r.db("beachfront").table("customers")
```

## Update customer

```js
r
  .db("beachfront")
  .table("customers")
  .get("21ec1045-7510-4a46-b469-ee8203dc0f59")
  .update({ role: "customer" })
```
