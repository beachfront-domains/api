CREATE MIGRATION m1pflzc3rre526d2co5fazc2zjfnyz5ix3corw5gtvqbrvz6pvpxvq
    ONTO m12plwerwcnob4bpnmc7yitksm7iehbrestjvi24dylvuw2v3brqsq
{
  ALTER TYPE default::Bag {
      DROP PROPERTY bag;
  };
};
