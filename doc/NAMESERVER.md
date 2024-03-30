
# nameserver

The nameserver is PowerDNS.

NOTE: Do Caddy first, then PowerDNS.
  - create /var/www/THE.DOMAIN and update index.html
  - update Caddyfile
  - restart Caddy

Seems like I need to do PowerDNS first, until I get to the TLSA part. Do Caddy completely. THEN finish PowerDNS.

## add a new domain

### create zone

```sh
sudo -u pdns pdnsutil create-zone THE.DOMAIN
```

### secure zone

```sh
sudo -u pdns pdnsutil secure-zone THE.DOMAIN
```

### add/update records

```sh
# NS record
sudo -u pdns pdnsutil add-record THE.DOMAIN. @ NS 10 "ns1.neuenic"

# A record
sudo -u pdns pdnsutil add-record THE.DOMAIN. @ A 10 50.116.2.11

# SOA record
pdnsutil replace-rrset THE.DOMAIN. @ SOA 10 "THE.DOMAIN hostmaster.THE.DOMAIN 0 10800 3600 604800 150"

# TLSA (only do this if grabbing from Dolo)
pdnsutil replace-rrset THE.DOMAIN. _443._tcp. TLSA 10 "0 0 0 A000AA0000A0AAAA00AAAA000A0AA0000AA0A000000A0A0AAA0A00A000000A0A"
```

### get DS record

This DS record (SHA56 digest) is necessary to complete chain of trust with this domain's TLD.

```sh
pdnsutil show-zone THE.DOMAIN
```

### add records to parent TLD

For TLDs, the `DS` and `NS` (or, `GLUE`) records are already added to the parent zone...the blockchain.

```sh
# NOTE
# default TTL is an hour (3600)...see if changing to `10` will make sites resolve faster

# DS record
sudo -u pdns pdnsutil add-record DOMAIN. THE. DS 10 "0000 00 0 A000AA0000A0AAAA00AAAA000A0AA0000AA0A000000A0A0AAA0A00A000000A0A"

# NS record
sudo -u pdns pdnsutil add-record DOMAIN. THE. NS 10 "ns1.neuenic"
```

### update Caddy before adding TLSA record

```sh
# TLSA record now, or when the site config is in Caddy, and Caddy is restarted?
sudo -u pdns pdnsutil add-record THE.DOMAIN. _443._tcp. TLSA 10 "$(curl -s https://acme.htools.work/tlsa/THE.DOMAIN | jq -r .tlsa)"

# pdnsutil replace-rrset lynk. _443._tcp. TLSA 10 "3 1 2 f4a1dcea006a1dc085b4789e01f255e3740a7879ffaef41d3ba0b19662af8c04e361bdb78ac05b74975969e66ec42e32f2f0fb350e44aa0ad79a6f109ce7ff14"

# _443._tcp.lynk  3600  IN  TLSA  3 1 2 f4a1dcea006a1dc085b4789e01f255e3740a7879ffaef41d3ba0b19662af8c04e361bdb78ac05b74975969e66ec42e32f2f0fb350e44aa0ad79a6f109ce7ff14
```

### rectify zone and increase serial

```sh
pdnsutil increase-serial THE.DOMAIN
pdnsutil rectify-zone THE.DOMAIN
```

# rectify parent zone

```sh
pdnsutil increase-serial DOMAIN
pdnsutil rectify-zone DOMAIN
```

### increase serials

```sh
pdnsutil increase-serial THE.DOMAIN
pdnsutil increase-serial DOMAIN
```

### rectify zone

```sh
pdnsutil rectify-zone THE.DOMAIN
pdnsutil list-zone THE.DOMAIN
```

```sh
# curl -s https://acme.htools.work/tlsa/THE.DOMAIN | jq .tlsa
# sudo -u pdns pdnsutil add-record tune.lynk. _443._tcp. TLSA 10 "$(curl -s https://acme.htools.work/tlsa/tune.lynk | jq -r .tlsa)"

# TLSA record | TTL should be 10 so the site is secured ASAP
# sudo -u pdns pdnsutil add-record THE.DOMAIN. _443._tcp. TLSA 10 "0 0 0 000000000AA000A0AAA0A000AA00A00AAA0AAAA000A0000AA0A00A000AAA00AA"
# sudo -u pdns pdnsutil add-record THE.DOMAIN. _443._tcp. TLSA 10 "$(curl -s https://acme.htools.work/tlsa/THE.DOMAIN | jq -r .tlsa)"
```

```sh
# delete TLSA record `_443._tcp.tune.lynk` from `tune.lynk`
pdnsutil delete-rrset tune.lynk _443._tcp TLSA

# delete TLSA record `the.lynk` from `lynk`
pdnsutil delete-rrset lynk the DS

# update TLSA record on `test.lynk`
pdnsutil replace-rrset test.lynk. _443._tcp. TLSA 10 "3 1 2 C943051C45D4A1B92B08D861D4F47D1B11E7C8E4D2574CF59F21FC0C EA081A59729BC7D42410EC83EC195D569657A6F29E5B43CCB2FFF416 506D5E7924C52CD6"
# 3 1 2 C943051C45D4A1B92B08D861D4F47D1B11E7C8E4D2574CF59F21FC0C EA081A59729BC7D42410EC83EC195D569657A6F29E5B43CCB2FFF416 506D5E7924C52CD6
```

```sh
pdnsutil check-zone THE.DOMAIN

# wipe zone contents
pdnsutil clear-zone THE.DOMAIN

pdnsutil delete-zone THE.DOMAIN

pdnsutil list-zone THE.DOMAIN
```

one.lynk ::: 10:34 ::: htools.work seems to wait a lil' bit to provide cert

;; add records from Dolo
  # SOA comes by default, so we replace the record instead of add it.
  sudo -u pdns pdnsutil replace-rrset secret.lynk. @ SOA "secret.lynk hostmaster.secret.lynk 0 86400 7200 604800 300"
  # TLSA
  sudo -u pdns pdnsutil add-record secret.lynk. _443._tcp. TLSA 3600 "3 1 2 3654F2EF77F7DC5083FC3FF663A2921B034D1476A31F8EE89B5931AE 18DFD71E8848CB398C422E45E148D2ED0DAE7BABC7BC953A6AB72DC2 5D1F65E95880A9BA"
