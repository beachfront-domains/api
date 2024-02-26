module default {
  scalar type AccountRole extending enum<"ADMIN", "CUSTOMER">;
  scalar type AccountLoginMethod extending enum<"LINK", "TOKEN">;
  scalar type ExtensionTier extending enum<"DEFAULT", "COMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC">;
  scalar type InvoiceNumber extending sequence;
  scalar type InvoicePaymentType extending enum<"ACH", "BTC", "CREDITCARD", "ETH", "HNS", "WIRE">;
  scalar type OrderNumber extending sequence;
  scalar type PaymentKind extending enum<"BTC", "ETH", "FIAT", "HNS">;
  scalar type PaymentVendorName extending enum<"OPENNODE", "SQUARE", "STRIPE">;

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
    required created: datetime {
      default := datetime_of_transaction();
      readonly := true;
    };
    required updated: datetime {
      default := datetime_of_transaction();
    };
  }

  type Bag extending BaseRecord {
    bag: array<tuple<
      duration: int16,
      name: str,
      premium: int16,
      price: str,
      tier: ExtensionTier
    >>;
    currency: PaymentKind {
      default := PaymentKind.FIAT;
    };
    link customer: Customer;
  }

  type Customer extending BaseRecord {
    required email: str {
      constraint exclusive;
    };
    loginMethod: AccountLoginMethod {
      default := AccountLoginMethod.LINK;
    };
    name: str {
      default := "Anon Mous";
    };
    role: AccountRole {
      default := AccountRole.CUSTOMER;
    };
    staff: int16 {
      default := 0;
    };
    stripe: str;
    timezone: str;
    username: str {
      constraint exclusive;
    };
    verified: int16 {
      default := 0;
    };
    #
    index on ((.email, .username));
  }

  type Domain extending BaseRecord {
    required expiry: datetime;
    required link extension: Extension;
    required name: str;
    link owner: Customer;
    property premium -> int16 {
      default := 0;
    };
    status: DomainStatusCode {
      default := DomainStatusCode.PENDING_CREATE;
    };
    #
    index on (.name);
  }

  type Extension extending BaseRecord {
    description: str;
    hash: str;
    mature: int16 {
      default := 0;
    };
    required name: str;
    pairs: array<str>;
    premium: array<str>;
    registry: str;
    reserved: array<str>;
    tier: ExtensionTier {
      default := ExtensionTier.DEFAULT;
    };
    #
    index on (.name);
  }

  type Invoice extending BaseRecord {
    required amount: int16;
    required contents: array<str>;
    required link customer: Customer;
    invoiceId: InvoiceNumber {
      constraint exclusive;
    }
    paid: int16 {
      default := 0;
    };
    payment: InvoicePaymentType {
      default := InvoicePaymentType.CREDITCARD;
    };
    promo: str;
    vendor: str;
  }

  type Key extending BaseRecord {
    required link owner: Customer;
  }

  type Login extending BaseRecord {
    required link `for` -> Customer;
    required property token -> str;
  }

  type Order extending BaseRecord {
    bag: array<tuple<
      duration: int16,
      name: str,
      premium: int16,
      price: str,
      tier: ExtensionTier
    >>;
    currency: str;
    link customer: Customer;
    number: OrderNumber;
    paid: int16 {
      default := 0;
    };
    promo: str;
    total: str;
    vendor: tuple<
      id: str,
      name: PaymentVendorName
    >;
  }

  type Payment extending BaseRecord {
    required link customer: Customer;
    kind: PaymentKind {
      default := PaymentKind.FIAT;
    };
    required mask: str;
    required vendorId: str;
  }

  type Session extending BaseRecord {
    property expires -> datetime;
    property device -> str;
    required link `for` -> Customer;
    property ip -> str;
    property nickname -> str;
    required property token -> str;
  }
}
