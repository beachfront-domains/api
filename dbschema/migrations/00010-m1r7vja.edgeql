CREATE MIGRATION m1r7vja4qogj5e6zotw6oe7morsvawtihl45klunqmcysbshgdyd2a
    ONTO m1a5pn2xc73nenaymwvadhoiaigebbdffurwrb4hxoafw4vkvfrtha
{
  ALTER TYPE default::Bag {
      ALTER PROPERTY bag {
          SET TYPE tuple<duration: std::int16, name: std::str, price: std::str> USING (SELECT
              (
                  duration := .bag.duration,
                  name := .bag.name,
                  price := std::to_str(.bag.price)
              )
          );
      };
  };
};
