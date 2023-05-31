CREATE MIGRATION m1xfxfmegu5by46oylqnrrfkwnrsbtymz2y2okmikldz2utoqyn2ya
    ONTO initial
{
  CREATE MODULE api IF NOT EXISTS;
  CREATE TYPE api::Key {
      CREATE REQUIRED PROPERTY created -> std::datetime {
          SET default := (std::datetime_of_transaction());
          SET readonly := true;
      };
      CREATE REQUIRED PROPERTY updated -> std::datetime {
          SET default := (std::datetime_of_transaction());
      };
      CREATE REQUIRED PROPERTY url -> std::str;
  };
  CREATE ABSTRACT TYPE default::BaseRecord {
      CREATE REQUIRED PROPERTY created -> std::datetime {
          SET default := (std::datetime_of_transaction());
          SET readonly := true;
      };
      CREATE REQUIRED PROPERTY updated -> std::datetime {
          SET default := (std::datetime_of_transaction());
      };
  };
  CREATE SCALAR TYPE default::AccountLoginMethod EXTENDING enum<LINK, TOKEN>;
  CREATE SCALAR TYPE default::AccountRole EXTENDING enum<ADMIN, CUSTOMER>;
  CREATE TYPE default::Customer EXTENDING default::BaseRecord {
      CREATE REQUIRED PROPERTY email -> std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY username -> std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE INDEX ON ((.email, .username));
      CREATE PROPERTY loginMethod -> default::AccountLoginMethod {
          SET default := (default::AccountLoginMethod.LINK);
      };
      CREATE PROPERTY name -> std::str {
          SET default := 'Anon Mous';
      };
      CREATE PROPERTY role -> default::AccountRole {
          SET default := (default::AccountRole.CUSTOMER);
      };
      CREATE PROPERTY staff -> std::int16 {
          SET default := 0;
      };
      CREATE PROPERTY timezone -> std::str;
      CREATE PROPERTY verified -> std::int16 {
          SET default := 0;
      };
  };
  CREATE TYPE default::Extension EXTENDING default::BaseRecord {
      CREATE REQUIRED PROPERTY name -> std::str;
      CREATE INDEX ON (.name);
      CREATE REQUIRED PROPERTY registry -> std::str;
  };
  CREATE SCALAR TYPE default::DomainStatusCode EXTENDING enum<ADD_PERIOD, AUTO_RENEW_PERIOD, CLIENT_DELETE_PROHIBITED, CLIENT_HOLD, CLIENT_RENEW_PROHIBITED, CLIENT_TRANSFER_PROHIBITED, CLIENT_UPDATE_PROHIBITED, INACTIVE, OK, PENDING_CREATE, PENDING_DELETE, PENDING_RENEW, PENDING_RESTORE, PENDING_TRANSFER, PENDING_UPDATE, REDEMPTION_PERIOD, RENEW_PERIOD, SERVER_DELETE_PROHIBITED, SERVER_HOLD, SERVER_RENEW_PROHIBITED, SERVER_TRANSFER_PROHIBITED, SERVER_UPDATE_PROHIBITED, TRANSFER_PERIOD>;
  CREATE TYPE default::Domain EXTENDING default::BaseRecord {
      CREATE LINK owner -> default::Customer;
      CREATE REQUIRED PROPERTY name -> std::str;
      CREATE INDEX ON (.name);
      CREATE REQUIRED LINK extension -> default::Extension;
      CREATE REQUIRED PROPERTY expiry -> std::datetime;
      CREATE PROPERTY status -> default::DomainStatusCode {
          SET default := (default::DomainStatusCode.PENDING_CREATE);
      };
  };
  CREATE SCALAR TYPE default::InvoiceNumber EXTENDING std::sequence;
  CREATE SCALAR TYPE default::InvoicePaymentType EXTENDING enum<ACH, BTC, CREDITCARD, ETH, HNS, WIRE>;
  CREATE TYPE default::Invoice EXTENDING default::BaseRecord {
      CREATE REQUIRED LINK customer -> default::Customer;
      CREATE REQUIRED PROPERTY amount -> std::int16;
      CREATE REQUIRED PROPERTY contents -> array<std::str>;
      CREATE PROPERTY invoiceId -> default::InvoiceNumber {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY paid -> std::int16 {
          SET default := 0;
      };
      CREATE PROPERTY payment -> default::InvoicePaymentType {
          SET default := (default::InvoicePaymentType.CREDITCARD);
      };
      CREATE PROPERTY promo -> std::str;
      CREATE PROPERTY vendor -> std::str;
  };
  CREATE TYPE default::Key EXTENDING default::BaseRecord {
      CREATE REQUIRED LINK owner -> default::Customer;
  };
  CREATE SCALAR TYPE default::PaymentKind EXTENDING enum<CRYPTOCURRENCY, FIAT>;
  CREATE TYPE default::Payment EXTENDING default::BaseRecord {
      CREATE REQUIRED LINK customer -> default::Customer;
      CREATE PROPERTY kind -> default::PaymentKind {
          SET default := (default::PaymentKind.FIAT);
      };
      CREATE REQUIRED PROPERTY mask -> std::str;
      CREATE REQUIRED PROPERTY vendorId -> std::str;
  };
  CREATE TYPE default::Session EXTENDING default::BaseRecord {
      CREATE LINK customer -> default::Customer;
      CREATE REQUIRED PROPERTY cart -> tuple<duration: std::int16, name: std::str, price: std::int16>;
  };
};
