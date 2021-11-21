# domain

## create domain

Requires `extension` and `registrar` IDs, as well as domain `name`. `ascii` can be supplied but will be automatically generated if missing. `registrant` information is optional but at a bare minimum, you may want name and location.



## get domain

Requires domain `id`.

### Data Explorer query
```js
r.db("neuenet").table("domain")
```



## get domains

All acccepted parameters are optional: `active`, `created`, `expiry`, `extension`, `registrar`, and `updated`.



## update domain

Requires contract `id`. Operator can modify `active` and `expiry` params. A `false` value on `active` immediately voids the contract and registrar is prohibited from selling domains on the extension the contract covers. `expiry` parameter is only used for extending the life of the contract.



## delete domain

Requires domain `id`.
