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


## Notes

- When adding new TLDs to the database, be sure to update the TLD regex in the domain creation functions.
