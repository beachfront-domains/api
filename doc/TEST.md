# Test



## Testing the code

```sh
# typecheck the module
deno check --unstable --import-map import_map.json main.ts

# check opportunities for code cleanliness
deno lint src/
```

## Note

EdgeDB's auto-generated code prevents typechecking from succeeding, and Deno doesn't yet have a way to ignore directories during `deno check`.

So, we end up with errors like this:

```
error: TS2590 [ERROR]: Expression produces a union type that is too complex to represent.
> = $.$expr_Function<
    ^
    at file:///~/project/dbschema/edgeql-js/modules/std.ts:1698:5

TS2590 [ERROR]: Expression produces a union type that is too complex to represent.
> = $.$expr_Function<
    ^
    at file:///~/project/dbschema/edgeql-js/modules/std.ts:1753:5
```
