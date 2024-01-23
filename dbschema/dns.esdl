module dns {
  # taken from pastry-server
  scalar type CAATag extending enum<"iodef", "issue", "issuewild">;
  scalar type ClassType extending enum<CH, CS, HS, `IN`>;

  scalar type RecordType extending enum<
    "A",
    "AAAA",
    "CAA",
    "CNAME",
    "DNAME",
    "DNSKEY",
    "DS",
    "HINFO",
    "MX",
    "NAPTR",
    "NS",
    "NSEC",
    "NSEC3",
    "NULL",
    "OPT",
    "PTR",
    "RP",
    "RRSIG",
    "SOA",
    "SRV",
    "SSHFP",
    "TLSA",
    "TXT"
  >;

  abstract type BaseRecord {
    required class: ClassType {
      default := ClassType.`IN`;
    };
    required created: datetime {
      default := datetime_of_transaction();
      readonly := true;
    };
    required name: str;
    required ttl: float64 {
      default := 300;
    };
    required type: RecordType;
    required updated: datetime {
      default := datetime_of_transaction();
    };
  }

  type PlainRecord extending BaseRecord {
    required data: str;
  }

  type CAARecord extending BaseRecord {
    flags: float64 {
      default := 0; # integer between 0-255
    };
    issuerCritical: int16 {
      default := 0; # 0 for false, 1 for true
    };
    required tag: CAATag;
    required value: str; # no whitespace allowed
  }

  type DNSKEYRecord extending BaseRecord {
    required algorithm: float64;
    required flags: float64; # integer: 0, 256, or 257
    required key: str; # str|bytes (Buffer)
  }

  type DSRecord extending BaseRecord {
    required algorithm: float64;
    required digest: str; # str|bytes (Buffer)
    required digestType: float64;
    required keyTag: float64;
  }

  type HINFORecord extending BaseRecord {
    required data: tuple<cpu: str, os: str>;
  }

  type MXRecord extending BaseRecord {
    required exchange: str;
    required preference: float64;
  }

  type NAPTRRecord extending BaseRecord {
    required flags: str;
    required `order`: float64;
    required preference: float64;
    required `regexp`: str;
    required replacement: str;
    required services: str;
  }

  type NSECRecord extending BaseRecord {
    required nextDomain: str;
    required rrtypes: array<str>;
  }

  type NSEC3Record extending BaseRecord {
    required algorithm: float64;
    required flags: float64;
    required iterations: float64;
    required nextDomain: str; # str|bytes (Buffer)
    required rrtypes: array<str>;
    required salt: str; # str|bytes (Buffer)
  }

  # type NULLRecord extending BaseRecord {
  #   required data: str; # str|bytes (Buffer)
  # }

  # type OPTRecord extending BaseRecord {
  #   required flags: float64;
  #   # optional: all but code
  #   # family: 1 for IPv4, 2 for IPv6
  #   # code: float64|str
  #   # TODO: change `options.data` from `bytes` to `str`
  #   required options: array<tuple<
  #     code: str,
  #     data: bytes,
  #     family: float64,
  #     ip: str,
  #     length: float64,
  #     scopePrefixLength: float64,
  #     sourcePrefixLength: float64,
  #     tags: array<float64>,
  #     timeout: float64
  #   >>;
  #   required udpPayloadSize: float64;
  # }

  type RPRecord extending BaseRecord {
    required mbox: str;
    required txt: str;
  }

  type RRSIGRecord extending BaseRecord {
    required algorithm: float64;
    required expiration: float64; # timestamp
    required inception: float64; # timestamp
    required keyTag: float64;
    required labels: float64;
    required originalTTL: float64;
    required signature: str; # str|bytes (Buffer)
    required signersName: str;
    required typeCovered: str;
  }

  type SOARecord extending BaseRecord {
    required data: tuple<
      expire: float64,
      minimum: float64,
      mname: str,
      `refresh`: float64,
      retry: float64,
      rname: str,
      serial: float64
    >;
  }

  type SRVRecord extending BaseRecord {
    required data: tuple<
      port: float64,
      priority: float64,
      target: str,
      weight: float64
    >;
  }

  type SSHFPRecord extending BaseRecord {
    required algorithm: float64;
    required fingerprint: str;
    required hash: float64;
  }

  type TLSARecord extending BaseRecord {
    required certificate: str; # str|bytes (Buffer)
    required matchingType: float64;
    required selector: float64;
    required usage: float64;
  }
}
