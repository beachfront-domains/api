# api

> programmatic interface to beachfront/



## Prerequisites

- [RethinkDB](https://rethinkdb.com/docs/install)



## Prologue

TODO
: automate this entire prologue

There is a `database.conf.sample` file at the base of this repo. Fill out the parameters and remove `.sample` from the filename. After RethinkDB is installed, update the default admin password.

```sh
# First run
rethinkdb --config-file absolute/path/to/database.conf --initial-password "p@ssw0rd"

# Subsequent runs
rethinkdb --config-file absolute/path/to/database.conf
```

```js
// Within the Data Explorer
r.db("rethinkdb").table("users").insert([{
  id: "beachfront_admin",
  password: "p@ssw0rd"
}]);

r.grant("beachfront_admin", {
  config: true,
  connect: true,
  read: true,
  write: true
});
```



## Installation

```sh
$ npm i
```



## Development (different tabs/windows)

```sh
# tab/window 1
cd neuenet && rethinkdb --config-file absolute/path/to/database.conf
```

```sh
# tab/window 2
npm run watch
```



## Production

```sh
npm start
```



## Notes (development)

- [http://localhost:3354/graphql](http://localhost:3354/graphql) - API interface
- [http://localhost:8080](http://localhost:8080) - RethinkDB GUI



## URLs (legacy)

- `beachfront.digital`
- `beachfront.network`



## URLs

- `api.beachfront/`
- `app.beachfront/`
- `registrar.beachfront/` - redirects to `app.beachfront/`
