CREATE MIGRATION m1slqaoewcgp2awbz34ciosuvicwwlw6ydwb6c53ns26gm2lhpcbwq
    ONTO m1l42wn2qm2ycvmn2yer466anfbp67jbbppqprxrtg34q53sqh6aea
{
  ALTER TYPE default::Order {
      DROP PROPERTY bag;
  };
  ALTER TYPE default::Order {
      CREATE LINK bag: default::Bag;
  };
};
