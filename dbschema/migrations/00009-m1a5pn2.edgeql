CREATE MIGRATION m1a5pn2xc73nenaymwvadhoiaigebbdffurwrb4hxoafw4vkvfrtha
    ONTO m17jm4x3kpnxel4moqn7arlswgfcwozimara6k7nxdrvdjlktfzzlq
{
  ALTER TYPE default::Bag {
      CREATE PROPERTY currency: default::PaymentKind {
          SET default := (default::PaymentKind.FIAT);
      };
  };
  ALTER SCALAR TYPE default::PaymentKind EXTENDING enum<BTC, ETH, FIAT, HNS>;
};
