CREATE MIGRATION m1gyelixm6jxirtefizwe5cxfjrnwlmm5fpeloxzxm7nwmr2tj56ra
    ONTO m1yn3d47cjbeqyepe3bgdopwltek4f64oyza6z5ynrttotfqurkszq
{
  CREATE TYPE default::Bag EXTENDING default::BaseRecord {
      CREATE PROPERTY bag: array<tuple<duration: std::int16, name: std::str, paired: array<std::str>, premium: std::int16, price: std::str, tier: default::ExtensionTier>>;
      CREATE LINK customer: default::Customer;
      CREATE PROPERTY currency: default::PaymentKind {
          SET default := (default::PaymentKind.FIAT);
      };
  };
};
