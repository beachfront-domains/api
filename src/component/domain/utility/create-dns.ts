


/// import

import { log } from "dep/std.ts";
import { wretch } from "dep/x/wretch.ts";

/// util

import { nameserverKey, neuenic } from "src/utility/index.ts";

const thisFilePath = import.meta.filename;



/// export

export default async(domain: string) => {
  const extension = String(domain).split(".")[1];

  // TODO
  // : create and secure zone
  // : add A, NS, and SOA records
  // : get SHA-256 DS record
  // : add DS and NS records to parent (TLD) zone
  // : create server block in Caddy and reload
  // : query `https://acme.htools.work/tlsa/DOMAIN`
  // : add TLSA record
  // : increase serial
  // : rectify zone

  async function getDS() {
    try {
      const data = await wretch(
        `${neuenic}/${domain}./cryptokeys`, {
          headers: { "X-Api-Key": nameserverKey }
        })
        .get()
        .json();

      return data[0].ds[1];
    } catch(error) {
      const { status, text, url } = error;

      log.error(thisFilePath);
      log.error(`[${url}]› ${text}`);
    }
  }

  async function getTLSA() {
    try {
      const { tlsa } = await wretch(`https://acme.htools.work/tlsa/${domain}`).get().json();
      return tlsa;
    } catch(error) {
      console.log(">>> getTLSA");
      console.log(error);
      return null;
    }
  }

  // async function addRecords() {
  //   try {} catch(error) {
  //     const { status, text, url } = error;

  //     log.error(thisFilePath);
  //     log.error(`[${url}]› ${text}`);
  //   }
  // }

  async function addParentRecords() {
    // # DS record
    // sudo -u pdns pdnsutil add-record DOMAIN. THE. DS 10 "0000 00 0 A000AA0000A0AAAA00AAAA000A0AA0000AA0A000000A0A0AAA0A00A000000A0A"

    // # NS record
    // sudo -u pdns pdnsutil add-record DOMAIN. THE. NS 10 "ns1.neuenic"

    try {
      const dsRecord = await getDS();

      const data = await wretch(
        `${neuenic}/${extension}.`, {
          headers: { "X-Api-Key": nameserverKey }
        })
        .patch({
          rrsets: [
            {
              changetype: "REPLACE",
              name: `${domain}.`,
              records: [{
                content: dsRecord,
                disabled: false
              }],
              type: "DS",
              ttl: 10
            },
            {
              changetype: "REPLACE",
              name: `${domain}.`,
              records: [{
                content: "ns1.neuenic.",
                disabled: false
              }],
              type: "NS",
              ttl: 10
            }
          ]
        });
        // .json();

      return data;
    } catch(error) {
      const { status, text, url } = error;

      log.error(">>> addParentRecords");
      console.error(error);
      // log.error(`[${url}]› ${text}`);
    }
  }

  //

  async function addTLSA() {
    try {
      const tlsaRecord = await getTLSA();

      const data = await wretch(
        `${neuenic}/${domain}.`, {
          headers: { "X-Api-Key": nameserverKey }
        })
        .patch({
          rrsets: [
            {
              changetype: "REPLACE",
              name: `_443._tcp.${domain}.`,
              records: [{
                content: tlsaRecord,
                disabled: false
              }],
              type: "TLSA",
              ttl: 10
            }
          ]
        });
    } catch(error) {
      const { status, text, url } = error;

      log.error(thisFilePath);
      log.error(`[${url}]› ${text}`);
    }
  }

  // async function increaseSerial() {
  //   try {} catch(error) {
  //     const { status, text, url } = error;

  //     log.error(thisFilePath);
  //     log.error(`[${url}]› ${text}`);
  //   }
  // }

  async function createZone() {
    try {
      const data = await wretch(
        neuenic, {
          headers: { "X-Api-Key": nameserverKey }
        })
        .post({
          api_rectify: true,
          dnssec: true,
          // ^^ Switching dnssec to true (from false) sets up DNSSEC signing based on the other flags, this includes running the equivalent of secure-zone and rectify-zone (if api_rectify is set to true). This also applies to newly created zones.
          kind: "Native",
          masters: [],
          name: `${domain}.`,
          nameservers: ["ns1.neuenic."],
          rrsets: [
            {
              changetype: "REPLACE",
              name: `${domain}.`,
              records: [{
                content: "50.116.2.11",
                disabled: false
              }],
              type: "A",
              ttl: 10
            },
            {
              changetype: "REPLACE",
              name: `${domain}.`,
              records: [{
                content: `${domain}. hostmaster.${domain}. 0 10800 3600 604800 150`,
                disabled: false
              }],
              type: "SOA",
              ttl: 10
            }
          ]
        })
        .json();

      // # NS record
      // sudo -u pdns pdnsutil add-record THE.DOMAIN. @ NS 10 "ns1.neuenic"

      // # A record
      // sudo -u pdns pdnsutil add-record THE.DOMAIN. @ A 10 50.116.2.11

      // # SOA record
      // pdnsutil replace-rrset THE.DOMAIN. @ SOA 10 "THE.DOMAIN hostmaster.THE.DOMAIN 0 10800 3600 604800 150"

      return data;
    } catch(error) {
      const { status, text, url } = error;

      log.error(">>> createZone");
      log.error(`[${url}]› ${text}`);
    }
  }

  async function rectifyZone() {
    try {
      const data = await wretch(
        `${neuenic}/${domain}./rectify`, {
          headers: { "X-Api-Key": nameserverKey }
        })
        .put()
        .json();

      return data;
    } catch(error) {
      const { status, text, url } = error;

      log.error(thisFilePath);
      log.error(`[${url}]› ${text}`);
    }
  }

  async function rectifyParentZone() {
    try {
      const data = await wretch(
        `${neuenic}/${extension}./rectify`, {
          headers: { "X-Api-Key": nameserverKey }
        })
        .put()
        .json();

      return data;
    } catch(error) {
      const { status, text, url } = error;

      log.error(thisFilePath);
      log.error(`[${url}]› ${text}`);
    }
  }

  try {
    await createZone();
    await addParentRecords();
    await addTLSA();
    await rectifyZone();
    await rectifyParentZone(); // TODO: increment parent serial (SOA)

    log.info(`>>> ${domain} DNS updated`);

    return true;
  } catch(_) {
    const { status, text, url } = _;

    // log.error(`[${thisFilePath}]› ${text}`);

    log.error(thisFilePath);
    log.error(`[${url}]› ${text}`);

    return false;
  }
}
