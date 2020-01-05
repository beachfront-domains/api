# Beachfront API



## Prerequisites

- Install [RethinkDB](https://rethinkdb.com/docs/install)

```bash
# Install redis
$ brew install redis
```

## Prologue
After RethinkDB is installed, update the default admin password.

```bash
$ rethinkdb --server-name beachfront --driver-port 44129 --initial-password "p@ssw0rd"
```

```js
// Within the Data Explorer
r.db("rethinkdb").table("users").get("admin").update({
  password: "p@ssw0rd"
});
```

## Installation

```bash
$ npm i
```

## Development

```bash
# tab/window 1, "Beachfront" being the local directory
$ cd Beachfront;rethinkdb --driver-port 44129
```

```bash
# tab/window 2
$ redis-server
```

```bash
# tab/window 3
$ npm run watch
```

## Production

```bash
$ npm start
```

## Notes (development)
- [http://localhost:3354/graphql](http://localhost:3000/graphql) - API interface
- [http://localhost:8080](http://localhost:8080) - RethinkDB interface
