# Production

EdgeDB requires at least 1GB of RAM to function. So, make sure your serve has at least twice that. beachfront/ is rather minimal but extra overhead is never a bad thing to have.



## Update server packages

```sh
apt update && apt upgrade -y
```



## Install zsh

```sh
apt install zsh -y
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```



## Disable SSH password

```sh
nano /etc/ssh/sshd_config
```

Find `PasswordAuthentication yes` and change to `PasswordAuthentication no`. Save and close file.

### Restart SSH service

```sh
service ssh restart

# log out and login via SSH again to ensure it still works
reboot
```



## Setup EdgeDB

These instructions are taken from the official bare metal server [guide](https://www.edgedb.com/docs/guides/deployment/bare_metal) and assumes your server is Debian/Ubuntu.

### Import packaging key

```sh
mkdir -p /usr/local/share/keyrings && \
  curl --proto "=https" --tlsv1.2 -sSf \
  -o /usr/local/share/keyrings/edgedb-keyring.gpg \
  https://packages.edgedb.com/keys/edgedb-keyring.gpg
```

### Add package repository

```sh
echo deb [signed-by=/usr/local/share/keyrings/edgedb-keyring.gpg] \
  https://packages.edgedb.com/apt \
  $(grep "VERSION_CODENAME=" /etc/os-release | cut -d= -f2) main \
  | tee /etc/apt/sources.list.d/edgedb.list
```

### Install package

```sh
apt update && apt install edgedb-2 -y
```

### Enable systemd service

```sh
systemctl enable --now edgedb-server-2
```

### Set password

```sh
# probably a good idea to save this in a password manager…
echo -n "> " && read -s PASSWORD
```

The default listen address is `localhost` and the default port is `5656`. If you want to change those defaults, check how to do so [here](https://www.edgedb.com/docs/guides/deployment/bare_metal#set-a-password).

```sh
edgedb --port 5656 --tls-security insecure --admin query \
  "ALTER ROLE edgedb SET password := '$PASSWORD'"
```

### Restart service

```sh
systemctl restart edgedb-server-2
```

### Instance/CLI linking, part 1

In this example, `beachfront` is the name of our instance.

```sh
edgedb instance link \
  --host localhost \
  --port 5656 \
  --user edgedb \
  --database edgedb \
  --trust-tls-cert \
  beachfront
```

### Activate CLI for our instance

```sh
edgedb --instance beachfront
```

#### beachfront defaults

These commands are to be run within the EdgeDB CLI, sans `> `. Make sure to save the secret for `beachfrontAdmin` in a password manager.

```
> CREATE DATABASE beachfront;
> CREATE superuser ROLE beachfrontAdmin;
> ALTER ROLE beachfrontAdmin set password := "update-this-with-your-own-password";
> \exit
```

### Instance/CLI linking, part 2

This time we're going to link the `beachfront` instance with our desired parameters for user and database.

```sh
edgedb instance link \
  --host localhost \
  --port 5656 \
  --user beachfrontAdmin \
  --database beachfront \
  --trust-tls-cert \
  beachfront
```

### Initialize beachfront

After uploading this repo to your server, `cd` into it:

```sh
# process database migrations
edgedb migrate --instance beachfront --database beachfront

# initialize project
edgedb project init
```

### Access

There are two ways to access our database now.

#### Local

```sh
edgedb --instance beachfront
```

#### Remote

```sh
# make sure to replace "update-this-with-your-own-password" with actual password
edgedb --dsn edgedb://beachfrontAdmin:update-this-with-your-own-password@localhost:5656/beachfront --tls-security insecure
```



## Install Deno

```sh
apt install unzip -y
curl -fsSL https://deno.land/install.sh | sh

# then
nano /root/.zshrc

# paste into .zshrc and save/exit
export DENO_INSTALL="/root/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"
source /root/.zshrc
```



## Configure firewall

```sh
# check firewall status
ufw status

# see open ports
ss -tulpn

# look for specific port
# ss -tulpn | grep :53

# allow port 53
# ufw allow 53/udp
# ufw allow 53/tcp

# allow SSH (this is important)
ufw allow ssh

# allow regular traffic
# enable if pastry-api will access/run from this server
ufw allow http
ufw allow https

# enable firewall
ufw enable
```



## Configure process manager

### Install nvm

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash

# reload zsh to recognize nvm
source /root/.zshrc
```

### Install Node.js

```sh
nvm install node
```

### Install pm2

```sh
npm i -g pm2
```

#### Start api

`cd` into `api` directory:

```sh
pm2 start main.ts \
  --interpreter="deno" \
  --interpreter-args="run --allow-env --allow-net --allow-read --unstable --no-prompt" \
  --name "beachfront" -- start --production
```

#### Save pm2 config

```sh
pm2 startup
pm2 save
pm2 save --force
```
