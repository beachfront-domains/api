CREATE MIGRATION m15uxjpffbuvgejtercepesrxp3o24cqnttomtbb56s2zztyhfndqa
    ONTO m1gyelixm6jxirtefizwe5cxfjrnwlmm5fpeloxzxm7nwmr2tj56ra
{
  CREATE TYPE default::Website EXTENDING default::BaseRecord {
      CREATE REQUIRED LINK name: default::Domain;
      CREATE INDEX ON (.name);
      CREATE LINK owner: default::Customer;
      CREATE PROPERTY content: std::str;
  };
};
