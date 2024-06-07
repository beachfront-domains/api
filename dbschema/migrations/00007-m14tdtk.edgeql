CREATE MIGRATION m14tdtkyblrbcxbc7njm3ddkb2amsjvv3hj6cgd7ymqllj6ldxw47q
    ONTO m1qqxq4mnghb4ly7pw6g5mn7gqtl57kpjspzjro2a2jzgl2n6ebkyq
{
  ALTER TYPE default::Session RENAME TO default::Bag;
  ALTER TYPE default::Bag {
      ALTER PROPERTY cart {
          RENAME TO bag;
      };
  };
};
