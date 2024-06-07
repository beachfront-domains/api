# Development

This guide assumes you have already installed [Deno](https://deno.land/#installation) and [Denon](https://github.com/denosaurs/denon#install).



## Get started

```sh
# clone
git clone git@github.com:beachfront-registrar/api.git && cd api
```

```sh
# run this upon INITIAL clone
edgedb project init

# run this every time
denon start --development

# run denon with a stacktrace for Deno devs if a panic occurs
RUST_BACKTRACE=1 denon start --development

# what denon does under the hood:
deno run --allow-env --allow-net --allow-read --unstable --import-map import_map.json main.ts --development
```

That's it. Denon abstracts away a lot of Deno's default verboseness. Still, here's a breakdown of the Deno permissions required to run this module:

- `--allow-env` for .env access (for EdgeDB)
- `--allow-net` to open a port and be accessible online
- `--allow-read` to access `<CWD>` (current working directory)
- `--unstable` `Deno.connectTls#alpnProtocols` is an unstable API

We have `--development` for the API to know which environment variables to use for third-party services.



## EdgeDB

When connecting to EdgeDB for the first time, you're automatically connected to the default database (named `edgedb`). To delete this database you'll have to create or connect to your new desired database first.

```sh
# activate CLI
edgedb

# create desired database if it does not already exist
# all caps is not necessary, it is just convention…semi-colon is required
CREATE DATABASE beachfront;

# connect to just created database
\c beachfront;

# delete default database
DROP DATABASE edgedb;

# exit CLI
\q

# TODO
# : is instance already created via `edgedb project init`?
# : if not, include that information here
```

When running `edgedb` now, you'll get an error. This is because the CLI automatically connects to the default database.

```sh
edgedb error: UnknownDatabaseError: database "edgedb" does not exist
```

You can pass the `--branch` flag to connect as expected though.

```sh
edgedb --branch beachfront
```

When upgrading EdgeDB, you'll need to re-create the `edgedb` database (it can be safely removed once the upgrade is complete though).

### Schema Updates

```sh
# edgedb migrate --instance beachfront --branch primary
# whenever you make changes to the schema, run…
edgedb migration create --instance beachfront --branch beachfront

# …then, run this to apply changes
edgedb migrate --instance beachfront --branch beachfront

# query builder
deno run -A https://deno.land/x/edgedb@v1.4.1/generate.ts edgeql-js --instance beachfront --database beachfront --target deno
```

<!-- The query builder will generate files in `dbschema/edgeql-js`. You'll need to do a bit of manual work now. For every import that comes from `"/edgedb"`, replace with `"../../edgedb.ts";`. That way, the pastry-server binary will actually work when you compile it. -->

<!--
### Data Explorer

Here are some examples of how to add records to the database via the `edgedb` CLI. Invoke the CLI with `edgedb --instance beachfront`.

#### Insert A record

```
insert PlainRecord {
  class := "IN",
  data := "123.345.567.789",
  name := "domain.tld",
  ttl := 604800,
  type := "A",
  created := datetime_of_transaction(),
  updated := datetime_of_transaction()
};
```

#### Insert AAAA record

```
insert PlainRecord {
  class := "IN",
  data := "2002:20f1:7112:523e:6511:14ff:fe8f:979d",
  name := "domain.tld",
  ttl := 604800,
  type := "AAAA",
  created := datetime_of_transaction(),
  updated := datetime_of_transaction()
};
```
-->

### UI

To view the database via the embedded UI:

```sh
edgedb ui --print-url
```
