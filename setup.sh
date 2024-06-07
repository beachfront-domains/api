#!/bin/bash
# chmod +x setup.sh to activate script
# RUN THIS SCRIPT INSIDE PROJECT DIRECTORY



# exit script whenever something fails
set -e

# ====================================================================================

sudo mkdir -p /usr/local/share/keyrings && \
  sudo curl --proto "=https" --tlsv1.2 -sSf \
  -o /usr/local/share/keyrings/edgedb-keyring.gpg \
  https://packages.edgedb.com/keys/edgedb-keyring.gpg

echo deb [signed-by=/usr/local/share/keyrings/edgedb-keyring.gpg] \
  https://packages.edgedb.com/apt \
  $(grep "VERSION_CODENAME=" /etc/os-release | cut -d= -f2) main \
  | sudo tee /etc/apt/sources.list.d/edgedb.list

if [ $(lsb_release -cs) = "noble" ]; then
  # replace `noble` with `jammy`
  sed -i "s/noble/jammy/g" /etc/apt/sources.list.d/edgedb.list
  # download `libicu70`
  wget "http://mirrors.kernel.org/ubuntu/pool/main/i/icu/libicu70_70.1-2_amd64.deb"
  # install `libicu70`
  apt install ./libicu70_70.1-2_amd64.deb -y
  # remove `libicu70`
  rm libicu70_70.1-2_amd64.deb
fi

apt update && apt install edgedb-5 -y

systemctl enable --now edgedb-server-5

echo ""
echo "++++++++++++++++++++++++++++++++++++++++++++++++++++++++++"
echo "+ EdgeDB installed and service enabled                   +"
echo "++++++++++++++++++++++++++++++++++++++++++++++++++++++++++"
echo ""

# ====================================================================================

case $(uname -sm) in
  "Darwin x86_64") target="x86_64-apple-darwin" ;;
  "Darwin arm64") target="aarch64-apple-darwin" ;;
  "Linux aarch64") target="aarch64-unknown-linux-gnu" ;;
  *) target="x86_64-unknown-linux-gnu" ;;
esac

deno_uri="https://github.com/denoland/deno/releases/latest/download/deno-${target}.zip"
deno_directory="/home/edgedb/bin"
deno_exe="$deno_directory/deno"

if [ ! -d "$deno_directory" ]; then
  mkdir -p "$deno_directory"
fi

curl --fail --location --progress-bar --output "$deno_exe.zip" "$deno_uri"

if command -v unzip >/dev/null; then
  unzip -d "$deno_directory" -o "$deno_exe.zip"
else
  apt install unzip -y
  unzip -d "$deno_directory" -o "$deno_exe.zip"
fi

chmod +x "$deno_exe"
rm "$deno_exe.zip"

echo ""
echo "++++++++++++++++++++++++++++++++++++++++++++++++++++++++++"
echo "+ Deno was installed successfully to $deno_exe           +"
echo "++++++++++++++++++++++++++++++++++++++++++++++++++++++++++"
echo ""

# ====================================================================================

echo ""
echo "++++++++++++++++++++++++++++++++++++++++++++++++++++++++++"
echo "+ NEXT STEPS                                             +"
echo "++ add password to EdgeDB                                +"
echo "++ link instance                                         +"
echo "++ activate service file for API                         +"
echo "++ etc                                                   +"
echo "++++++++++++++++++++++++++++++++++++++++++++++++++++++++++"
echo ""



# via https://github.com/edgedb/edgedb/issues/7364#issuecomment-2120913558
# via https://deno.land/x/install@v0.1.9/install.sh
# via https://docs.edgedb.com/guides/deployment/bare_metal#set-a-password
