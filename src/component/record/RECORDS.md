
# CAA

## Example

```
; the CA "ca.example.net" has requested its customer
; "example.com" to specify the CA's account number
; "230123" in each of the customer's CAA records.

type  flags  tag    value
CAA   0      issue  "ca.example.net; account=230123"
CAA   0      issue  "ca.example.net"
CAA   0      iodef  "mailto:security@example.com"
CAA   0      iodef  "http://iodef.example.com/"
```

## Notes

- `issuerCritical` should be set to `0` by default. `1` if `true`.



# DNSKEY

## Example

```
                          type     flags           algorithm  key
NAME         TTL   CLASS  RR TYPE  FLAG  PROTOCOL  ALGORITHM  PUBLIC KEY (BASE64)
example.com. 86400 IN     DNSKEY   256   3         5          ( AQPSKmynfzW4kyBv015MUG2DeIQ3
                                                                Cbl+BBZH4b/0PY1kxkmvHjcZc8no
                                                                kfzj31GajIQKY+5CptLr3buXA10h
                                                                WqTkF7H6RfoRqXQeogmMHfpftf6z
                                                                Mv1LyBUgia7za6ZEzOJBOztyvhjL
                                                                742iU/TpPSEDhm2SNKLijfUppn1U
                                                                aNvv4w==  )
```

## Notes

- FLAG can only be: 0, 256, or 257
- PROTOCOL **must** be 3
  - via https://www.rfc-editor.org/rfc/rfc4034#section-2.2
- ALGORITHM should be one of these:
  -  5 (required for DNSSEC validation, not recommended for DNSSEC signing)
  -  7 (required for DNSSEC validation, not recommended for DNSSEC signing)
  -  8 (required for DNSSEC validation and DNSSEC signing)
  - 10 (required for DNSSEC validation, not recommended for DNSSEC signing)
  - 12 (optional for DNSSEC validation, must not implement for DNSSEC signing)
  - 13 (required for DNSSEC validation and DNSSEC signing)
  - 14 (recommended for DNSSEC validation, optional for DNSSEC signing)
  - 15 (recommended for DNSSEC validation and DNSSEC signing)
  - 16 (recommended for DNSSEC validation, optional for DNSSEC signing)
  - via https://en.wikipedia.org/wiki/Domain_Name_System_Security_Extensions#Algorithms
- PUBLIC KEY **must** be Base64 encoded
