# api



## Prerequisites

- [Redis](https://formulae.brew.sh/cask/redis)
- [RethinkDB](https://rethinkdb.com/docs/install)
- [toml-sort](https://github.com/pappasam/toml-sort)



## Prologue

There is a `database.conf.sample` file at the base of this repo. Fill out the parameters and remove `.sample` from the filename. After RethinkDB is installed, update the default admin password.

```sh
rethinkdb --config-file absolute/path/to/database.conf --initial-password "p@ssw0rd"
```

```js
// Within the Data Explorer
r.db("rethinkdb").table("users").insert([{
  id: "beachfrontAdmin",
  password: "p@ssw0rd"
}]);

r.grant("beachfrontAdmin", {
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



## Generators

```sh
# This parses "neuenet.toml" and spits
# out "tlds.toml" with pricing information
#
# If there is an error, that means a name
# was added that was not rated on Niami yet
#
# Add "console.log(tldData.name);"
# in the "generateTOML" function to find it
$ node ./data/generate-toml.mjs

# The organizes "tlds.toml" in place to
# alphabetical order
$ toml-sort ./data/tlds.toml --in-place
```

## Development (different tabs/windows)

```sh
# tab/window 1
$ cd beachfront;rethinkdb --driver-port 44129
```

```sh
# tab/window 2
$ redis-server
```

```sh
# tab/window 3
$ npm run watch
```



## Production

```sh
$ npm start
```

## Notes (development)
- [http://localhost:3354/graphql](http://localhost:3354/graphql) - API interface
- `44129` - RethinkDB port
- [http://localhost:8080](http://localhost:8080) - RethinkDB GUI
