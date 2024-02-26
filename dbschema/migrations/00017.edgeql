CREATE MIGRATION m1l42wn2qm2ycvmn2yer466anfbp67jbbppqprxrtg34q53sqh6aea
    ONTO m1pflzc3rre526d2co5fazc2zjfnyz5ix3corw5gtvqbrvz6pvpxvq
{
  ALTER TYPE default::Bag {
      CREATE PROPERTY bag: array<tuple<duration: std::int16, name: std::str, premium: std::int16, price: std::str, tier: default::ExtensionTier>>;
  };
};
