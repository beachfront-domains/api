# @webb/jsonwebtoken

Only two dependencies


## usage

```ts
import { decode, sign, verify } from "@webb/jsonwebtoken";
```

## sign
```ts
sign({ foo: "bar" }, "SECRET");
```

## decode
```ts
decode("eyJhbGci...");
```

## verify
```ts
verify("eyJhbGci...", "SECRET");
```
