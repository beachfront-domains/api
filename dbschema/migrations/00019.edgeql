CREATE MIGRATION m1womcf3ns5gp6gt7jm75nbhxoffgm7ptb2lh3mr6c72re2vetqstq
    ONTO m1slqaoewcgp2awbz34ciosuvicwwlw6ydwb6c53ns26gm2lhpcbwq
{
  ALTER TYPE default::Order {
      DROP LINK bag;
  };
  ALTER TYPE default::Order {
      CREATE PROPERTY bag: array<tuple<duration: std::int16, name: std::str, premium: std::int16, price: std::str, tier: default::ExtensionTier>>;
  };
};
