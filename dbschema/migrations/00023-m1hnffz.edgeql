CREATE MIGRATION m1hnffzpjrid3xlxkpwwv5ib7olukoam73vogxa32mxpyizmjwbsfa
    ONTO m15uxjpffbuvgejtercepesrxp3o24cqnttomtbb56s2zztyhfndqa
{
  ALTER TYPE default::Website {
      DROP INDEX ON (.name);
  };
  ALTER TYPE default::Website {
      ALTER LINK name {
          RENAME TO domain;
      };
  };
  ALTER TYPE default::Website {
      CREATE INDEX ON (.domain);
  };
};
