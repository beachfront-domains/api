CREATE MIGRATION m162vs2tvitm6w4xvly6ptpvs3oobafrcl2lyqiqtnb6wsydgaeujq
    ONTO m1iu4pglheo32y6vylddb6fet33h2k5rhgui6y5hoyrxbb3gqivbkq
{
  CREATE MODULE dns IF NOT EXISTS;
  ALTER TYPE default::Domain {
      CREATE PROPERTY premium: std::int16 {
          SET default := 0;
      };
  };
  CREATE SCALAR TYPE dns::ClassType EXTENDING enum<CH, CS, HS, `IN`>;
  CREATE SCALAR TYPE dns::RecordType EXTENDING enum<A, AAAA, CAA, CNAME, DNAME, DNSKEY, DS, HINFO, MX, NAPTR, NS, NSEC, NSEC3, NULL, OPT, PTR, RP, RRSIG, SOA, SRV, SSHFP, TLSA, TXT>;
  CREATE ABSTRACT TYPE dns::BaseRecord {
      CREATE REQUIRED PROPERTY class: dns::ClassType {
          SET default := (dns::ClassType.`IN`);
      };
      CREATE REQUIRED PROPERTY created: std::datetime {
          SET default := (std::datetime_of_transaction());
          SET readonly := true;
      };
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE REQUIRED PROPERTY ttl: std::float64 {
          SET default := 300;
      };
      CREATE REQUIRED PROPERTY type: dns::RecordType;
      CREATE REQUIRED PROPERTY updated: std::datetime {
          SET default := (std::datetime_of_transaction());
      };
  };
  CREATE SCALAR TYPE dns::CAATag EXTENDING enum<iodef, issue, issuewild>;
  CREATE TYPE dns::CAARecord EXTENDING dns::BaseRecord {
      CREATE PROPERTY flags: std::float64 {
          SET default := 0;
      };
      CREATE PROPERTY issuerCritical: std::int16 {
          SET default := 0;
      };
      CREATE REQUIRED PROPERTY tag: dns::CAATag;
      CREATE REQUIRED PROPERTY value: std::str;
  };
  CREATE TYPE dns::DNSKEYRecord EXTENDING dns::BaseRecord {
      CREATE REQUIRED PROPERTY algorithm: std::float64;
      CREATE REQUIRED PROPERTY flags: std::float64;
      CREATE REQUIRED PROPERTY key: std::str;
  };
  CREATE TYPE dns::DSRecord EXTENDING dns::BaseRecord {
      CREATE REQUIRED PROPERTY algorithm: std::float64;
      CREATE REQUIRED PROPERTY digest: std::str;
      CREATE REQUIRED PROPERTY digestType: std::float64;
      CREATE REQUIRED PROPERTY keyTag: std::float64;
  };
  CREATE TYPE dns::HINFORecord EXTENDING dns::BaseRecord {
      CREATE REQUIRED PROPERTY data: tuple<cpu: std::str, os: std::str>;
  };
  CREATE TYPE dns::MXRecord EXTENDING dns::BaseRecord {
      CREATE REQUIRED PROPERTY exchange: std::str;
      CREATE REQUIRED PROPERTY preference: std::float64;
  };
  CREATE TYPE dns::NAPTRRecord EXTENDING dns::BaseRecord {
      CREATE REQUIRED PROPERTY flags: std::str;
      CREATE REQUIRED PROPERTY order: std::float64;
      CREATE REQUIRED PROPERTY preference: std::float64;
      CREATE REQUIRED PROPERTY regexp: std::str;
      CREATE REQUIRED PROPERTY replacement: std::str;
      CREATE REQUIRED PROPERTY services: std::str;
  };
  CREATE TYPE dns::NSEC3Record EXTENDING dns::BaseRecord {
      CREATE REQUIRED PROPERTY algorithm: std::float64;
      CREATE REQUIRED PROPERTY flags: std::float64;
      CREATE REQUIRED PROPERTY iterations: std::float64;
      CREATE REQUIRED PROPERTY nextDomain: std::str;
      CREATE REQUIRED PROPERTY rrtypes: array<std::str>;
      CREATE REQUIRED PROPERTY salt: std::str;
  };
  CREATE TYPE dns::NSECRecord EXTENDING dns::BaseRecord {
      CREATE REQUIRED PROPERTY nextDomain: std::str;
      CREATE REQUIRED PROPERTY rrtypes: array<std::str>;
  };
  CREATE TYPE dns::PlainRecord EXTENDING dns::BaseRecord {
      CREATE REQUIRED PROPERTY data: std::str;
  };
  CREATE TYPE dns::RPRecord EXTENDING dns::BaseRecord {
      CREATE REQUIRED PROPERTY mbox: std::str;
      CREATE REQUIRED PROPERTY txt: std::str;
  };
  CREATE TYPE dns::RRSIGRecord EXTENDING dns::BaseRecord {
      CREATE REQUIRED PROPERTY algorithm: std::float64;
      CREATE REQUIRED PROPERTY expiration: std::float64;
      CREATE REQUIRED PROPERTY inception: std::float64;
      CREATE REQUIRED PROPERTY keyTag: std::float64;
      CREATE REQUIRED PROPERTY labels: std::float64;
      CREATE REQUIRED PROPERTY originalTTL: std::float64;
      CREATE REQUIRED PROPERTY signature: std::str;
      CREATE REQUIRED PROPERTY signersName: std::str;
      CREATE REQUIRED PROPERTY typeCovered: std::str;
  };
  CREATE TYPE dns::SOARecord EXTENDING dns::BaseRecord {
      CREATE REQUIRED PROPERTY data: tuple<expire: std::float64, minimum: std::float64, mname: std::str, `refresh`: std::float64, retry: std::float64, rname: std::str, serial: std::float64>;
  };
  CREATE TYPE dns::SRVRecord EXTENDING dns::BaseRecord {
      CREATE REQUIRED PROPERTY data: tuple<port: std::float64, priority: std::float64, target: std::str, weight: std::float64>;
  };
  CREATE TYPE dns::SSHFPRecord EXTENDING dns::BaseRecord {
      CREATE REQUIRED PROPERTY algorithm: std::float64;
      CREATE REQUIRED PROPERTY fingerprint: std::str;
      CREATE REQUIRED PROPERTY hash: std::float64;
  };
  CREATE TYPE dns::TLSARecord EXTENDING dns::BaseRecord {
      CREATE REQUIRED PROPERTY certificate: std::str;
      CREATE REQUIRED PROPERTY matchingType: std::float64;
      CREATE REQUIRED PROPERTY selector: std::float64;
      CREATE REQUIRED PROPERTY usage: std::float64;
  };
};
