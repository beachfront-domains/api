CREATE MIGRATION m12plwerwcnob4bpnmc7yitksm7iehbrestjvi24dylvuw2v3brqsq
    ONTO m1tqukek6oujfnw7riru24g66ej56nhrurmqau5dkovmj7ajcawjlq
{
  ALTER TYPE default::Extension {
      CREATE PROPERTY description: std::str;
      CREATE PROPERTY hash: std::str;
  };
};
