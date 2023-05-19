# Overview

![](banner.png "beachfront api banner")

**beachfront/ is a registrar for the Neue Internet.** This module handles the API, written in [Deno](https://deno.land) (TypeScript) with an [EdgeDB](https://edgedb.com) backend.



## Table of Contents

- [Installation](./doc/INSTALLATION.md#installation)
  - [Installing from binaries](./doc/INSTALLATION.md#installing-from-binaries)
  - [Build binaries from source](./doc/INSTALLATION.md#build-binaries-from-source)
    - [Build for your platform](./doc/INSTALLATION.md#build-for-your-platform)
    - [Build for Linux](./doc/INSTALLATION.md#build-for-linux)
    - [Build for ARM-based Macs](./doc/INSTALLATION.md#build-for-arm-based-macs)
    - [Build for Intel-based Macs](./doc/INSTALLATION.md#build-for-intel-based-macs)
    - [Build for Windows](./doc/INSTALLATION.md#build-for-windows)
- [Development](./doc/DEVELOPMENT.md#development)
  - [Get started](./doc/DEVELOPMENT.md#get-started)
  - [EdgeDB](./doc/DEVELOPMENT.md#edgedb)
    - [Schema Updates](./doc/DEVELOPMENT.md#schema-updates)
    - [Embedded UI](./doc/DEVELOPMENT.md#ui)
- [Production](./doc/PRODUCTION.md#production)
  - [Update server packages](./doc/PRODUCTION.md#update-server-packages)
  - [Install zsh](./doc/PRODUCTION.md#install-zsh)
  - [Disable SSH password](./doc/PRODUCTION.md#disable-ssh-password)
    - [Restart SSH service](./doc/PRODUCTION.md#restart-ssh-service)
  - [Setup EdgeDB](./doc/PRODUCTION.md#setup-edgedb)
    - [Import packaging key](./doc/PRODUCTION.md#import-packaging-key)
    - [Add package repository](./doc/PRODUCTION.md#add-package-repository)
    - [Install package](./doc/PRODUCTION.md#install-package)
    - [Enable systemd service](./doc/PRODUCTION.md#enable-systemd-service)
    - [Set password](./doc/PRODUCTION.md#set-password)
    - [Restart service](./doc/PRODUCTION.md#restart-service)
    - [Instance/CLI linking, part 1](./doc/PRODUCTION.md#instancecli-linking-part-1)
    - [Activate CLI for our instance](./doc/PRODUCTION.md#activate-cli-for-our-instance)
      - [beachfront defaults](./doc/PRODUCTION.md#beachfront-defaults)
    - [Instance/CLI linking, part 2](./doc/PRODUCTION.md#instancecli-linking-part-2)
    - [Initialize beachfront API](./doc/PRODUCTION.md#initialize-beachfront)
    - [Access](./doc/PRODUCTION.md#access)
      - [Local](./doc/PRODUCTION.md#local)
      - [Remote](./doc/PRODUCTION.md#remote)
  - [Install Deno](./doc/PRODUCTION.md#install-deno)
  - [Configure firewall](./doc/PRODUCTION.md#configure-firewall)
  - [Configure process manager](./doc/PRODUCTION.md#configure-process-manager)
    - [Install nvm](./doc/PRODUCTION.md#install-nvm)
    - [Install Node.js](./doc/PRODUCTION.md#install-nodejs)
    - [Install pm2](./doc/PRODUCTION.md#install-pm2)
      - [Start beachfront API](./doc/PRODUCTION.md#start-api)
      - [Save pm2 config](./doc/PRODUCTION.md#save-pm2-config)
- [Test](./doc/TEST.md#test)
  - [Testing the code](./doc/TEST.md#testing-the-code)

---

## Intro

The point of this project is to enable CRUD operations on domains: creating, retrieving, updating, and deleting. Direct access should only be for the registry. Registrars will have to request an initial key in order to have access to this API. Registrars must maintain good standing with registry to enjoy continued API access.

Upon contract agreement, registrars will receive assets for advertising to their customers. And, they'll be able to create their own ads via our inhouse promotional generator tool.

API will handle:
- registrar CRUD
  - upon creation, registrar will have to agree to terms
    - if we identify conflicts with their registrant, they will be given a week to rectify...else, we will terminate registrant's domain
    - regular incidents will result in termination of agreement and registrar will be refunded remainder of subscription
  - registrar will not be able to delete their own account unless there are no domains in their custody
- domain CRUD
  - before any operation, ensure registrar is in good standing
    - registrar info in ctx?
- admin CRUD
  - has to approve registrar creation
- rate-limit, clients will have to implement exponential backoff
- admin and registrar sections should have ACL (access-control lists)/scoping to protect against accidental/malicious events

## Run

```sh
# --allow-env: for .env access (for EdgeDB)
# --allow-net: to open a port and be accessible online
# --allow-read: to access `<CWD>`
# --environment: there are checks for development vs production
# --unstable: `Deno.connectTls#alpnProtocols` is an unstable API
denon run --allow-env --allow-net --allow-read --unstable main.ts --environment=development

# alternatively...
denon run -A --unstable main.ts --environment=development
```

## Lint

```sh
deno lint src/
```

## Production

- https://www.edgedb.com/docs/guides/deployment/bare_metal
  - > once it's running, you need to do `systemctl edit edgedb-server-2 --full`, find the line that says `ExecStart=` and, at the very end of it, add `--admin-ui=enabled`, that'll let you have a web ui



## EdgeDB

When connecting to EdgeDB for the first time, you're automatically connected to the default database (named `edgedb`). To delete this database you'll have to create or connect to your desired database and run a command to delete the original one.

```sh
# activate CLI
edgedb

# create desired database if it does not already exist
# all caps is not necessary, it is just convention...ending semi-colon is required
CREATE DATABASE pastry;

# connect to desired database
\c pastry;

# delete default database
DROP DATABASE edgedb;

# exit CLI
\q
```

When running `edgedb` now, you'll get an error. This is because the CLI automatically connects to the database "`edgedb`."

```sh
edgedb error: UnknownDatabaseError: database 'edgedb' does not exist
```

You can pass a parameter to connect as expected though.

```sh
edgedb --database pastry
```

### Schema Updates

```sh
# whenever you make changes to the schema, run...
edgedb migration create --instance pastry --database pastry

# ...then, run this to apply changes
edgedb migrate --instance pastry --database pastry
```

To change a boolean to an integer, you'll have to supply a conversion expression, like so:

```
cast_expr> 0 if .enrolled = false else 1
```

Note: if you want to use keywords that are reserved in EdgeDB, you'll have to add backticks to those keyboard before that database will accept the updates.

### Query Builder

This must be run after every schema update:

```sh
deno run -A --unstable https://deno.land/x/edgedb@v1.1.0/generate.ts edgeql-js --instance pastry --database pastry
```

### UI

To view the database via the embedded UI:

```sh
edgedb ui --print-url
```
