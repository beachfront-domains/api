# Installation



## Installing from binaries

Precompiled binaries for Linux, macOS, and Windows are available from the [Releases page](https://github.com/beachfront-registrar/api/releases).



## Build binaries from source

You need [Deno](https://deno.land/#installation) installed before attempting to build. `script/build.sh` will automatically compile binaries for Linux, macOS, and Windows (just be sure to run `chmod +x build.sh` first). The commands in the next section will compile binaries to the `build/` folder.



### Build for your platform

By default, your platform is automatically detected so there's no need to provide `--output` and `--target` flags. You can use these flags to customize where your binary is compiled to, and its filename. The below command omits these flags so the output will be the base directory of this repo.

```sh
deno compile \
  --allow-env \
  --allow-net \
  --allow-read \
  --unstable \
  --output beachfront \
  main.ts
```

### Build for Linux

```sh
deno compile \
  --allow-env \
  --allow-net \
  --allow-read \
  --unstable \
  --output build/beachfront_linux \
  --target x86_64-unknown-linux-gnu \
  main.ts
```

### Build for ARM-based Macs

```sh
deno compile \
  --allow-env \
  --allow-net \
  --allow-read \
  --unstable \
  --output build/beachfront_macos \
  --target aarch64-apple-darwin \
  --import-map import_map.json \
  --no-check \
  main.ts
```

### Build for Intel-based Macs

```sh
deno compile \
  --allow-env \
  --allow-net \
  --allow-read \
  --unstable \
  --output build/beachfront_macos_intel \
  --target x86_64-apple-darwin \
  main.ts
```

### Build for Windows

```sh
deno compile \
  --allow-env \
  --allow-net \
  --allow-read \
  --unstable \
  --output build/beachfront_windows \
  --target x86_64-pc-windows-msvc \
  main.ts
```
