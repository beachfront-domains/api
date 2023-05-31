module default {
  scalar type AccountRole extending enum<"ADMIN", "CUSTOMER">;
  scalar type AccountLoginMethod extending enum<"LINK", "TOKEN">;
  scalar type ExtensionTier extending enum<"DEFAULT", "COMMON", "RARE", "EPIC", "LEGENDARY">;
  scalar type InvoiceNumber extending sequence;
  scalar type InvoicePaymentType extending enum<"ACH", "BTC", "CREDITCARD", "ETH", "HNS", "WIRE">;
  scalar type PaymentKind extending enum<"CRYPTOCURRENCY", "FIAT">;

  scalar type DomainStatusCode extending enum<
    "ADD_PERIOD",
    "AUTO_RENEW_PERIOD",
    "CLIENT_DELETE_PROHIBITED",
    "CLIENT_HOLD",
    "CLIENT_RENEW_PROHIBITED",
    "CLIENT_TRANSFER_PROHIBITED",
    "CLIENT_UPDATE_PROHIBITED",
    "INACTIVE",
    "OK",
    "PENDING_CREATE",
    "PENDING_DELETE",
    "PENDING_RENEW",
    "PENDING_RESTORE",
    "PENDING_TRANSFER",
    "PENDING_UPDATE",
    "REDEMPTION_PERIOD",
    "RENEW_PERIOD",
    "SERVER_DELETE_PROHIBITED",
    "SERVER_HOLD",
    "SERVER_RENEW_PROHIBITED",
    "SERVER_TRANSFER_PROHIBITED",
    "SERVER_UPDATE_PROHIBITED",
    "TRANSFER_PERIOD"
  >;

  abstract type BaseRecord {
    required property created -> datetime {
      default := datetime_of_transaction();
      readonly := true;
    };
    required property updated -> datetime {
      default := datetime_of_transaction();
    };
  }

  type Customer extending BaseRecord {
    required property email -> str {
      constraint exclusive;
    };
    property loginMethod -> AccountLoginMethod {
      default := AccountLoginMethod.LINK;
    };
    property name -> str {
      default := "Anon Mous";
    }
    property role -> AccountRole {
      default := AccountRole.CUSTOMER;
    };
    property staff -> int16 {
      default := 0;
    };
    property timezone -> str;
    property username -> str {
      constraint exclusive;
    };
    property verified -> int16 {
      default := 0;
    };
    #
    index on ((.email, .username));
  }

  type Domain extending BaseRecord {
    required property expiry -> datetime;
    required link extension -> Extension;
    required property name -> str;
    link owner -> Customer;
    property status -> DomainStatusCode {
      default := DomainStatusCode.PENDING_CREATE;
    };
    #
    index on (.name);
  }

  type Extension extending BaseRecord {
    required property name -> str;
    property pairs -> array<str>;
    property premium -> array<str>;
    property registry -> str;
    property tier -> ExtensionTier {
      default := ExtensionTier.DEFAULT;
    };
    #
    index on (.name);
  }

  type Invoice extending BaseRecord {
    required property amount -> int16;
    required property contents -> array<str>;
    required link customer -> Customer;
    property invoiceId -> InvoiceNumber {
      constraint exclusive;
    }
    property paid -> int16 {
      default := 0;
    };
    property payment -> InvoicePaymentType {
      default := InvoicePaymentType.CREDITCARD;
    };
    property promo -> str;
    property vendor -> str;
  }

  type Key extending BaseRecord {
    required link owner -> Customer;
  }

  type Payment extending BaseRecord {
    required link customer -> Customer;
    property kind -> PaymentKind {
      default := PaymentKind.FIAT;
    };
    required property mask -> str;
    required property vendorId -> str;
  }

  type Session extending BaseRecord {
    property cart -> tuple<
      duration: int16,
      name: str,
      price: int16
    >;
    link customer -> Customer;
  }
}
