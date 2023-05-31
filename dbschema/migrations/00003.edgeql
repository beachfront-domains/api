CREATE MIGRATION m13cddzf2ujkj5cpjtvdlomld6j6753ghb6lztial5yz3kstcyl7oa
    ONTO m1yq6upk5a7ypcgxc2wvzieo6ztsz2zdn7jok5w7ein2w6s6bvwn6a
{
  ALTER TYPE default::Extension {
      CREATE PROPERTY pairs -> array<std::str>;
  };
  ALTER TYPE default::Extension {
      CREATE PROPERTY premium -> array<std::str>;
      ALTER PROPERTY registry {
          RESET OPTIONALITY;
      };
  };
  CREATE SCALAR TYPE default::ExtensionTier EXTENDING enum<DEFAULT, COMMON, RARE, EPIC, LEGENDARY>;
  ALTER TYPE default::Extension {
      CREATE PROPERTY tier -> default::ExtensionTier {
          SET default := (default::ExtensionTier.DEFAULT);
      };
  };
};
