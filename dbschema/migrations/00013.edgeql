CREATE MIGRATION m1chfnwt5fdfap4tlfjyzz34pcu67x6w5fo4eboiah4ql54ipv3pba
    ONTO m1ahf24aoiiecmy43gxn57pcfrgoqppxcdyjw2snfp2kw3gc6ge5lq
{
  CREATE SCALAR TYPE default::OrderNumber EXTENDING std::sequence;
  CREATE SCALAR TYPE default::PaymentVendorName EXTENDING enum<OPENNODE, SQUARE, STRIPE>;
  CREATE TYPE default::Order EXTENDING default::BaseRecord {
      CREATE LINK customer: default::Customer;
      CREATE PROPERTY bag: array<tuple<duration: std::int16, name: std::str, price: std::str>>;
      CREATE PROPERTY currency: std::str;
      CREATE PROPERTY number: default::OrderNumber;
      CREATE PROPERTY paid: std::int16 {
          SET default := 0;
      };
      CREATE PROPERTY promo: std::str;
      CREATE PROPERTY total: std::str;
      CREATE PROPERTY vendor: tuple<id: std::str, name: default::PaymentVendorName>;
  };
};
