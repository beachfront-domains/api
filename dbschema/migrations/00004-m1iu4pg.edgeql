CREATE MIGRATION m1iu4pglheo32y6vylddb6fet33h2k5rhgui6y5hoyrxbb3gqivbkq
    ONTO m13cddzf2ujkj5cpjtvdlomld6j6753ghb6lztial5yz3kstcyl7oa
{
  ALTER TYPE default::Extension {
      CREATE PROPERTY mature: std::int16 {
          SET default := 0;
      };
      CREATE PROPERTY reserved: array<std::str>;
  };
  ALTER SCALAR TYPE default::ExtensionTier EXTENDING enum<DEFAULT, COMMON, RARE, EPIC, LEGENDARY, MYTHIC>;
};
