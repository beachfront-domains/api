CREATE MIGRATION m1tqukek6oujfnw7riru24g66ej56nhrurmqau5dkovmj7ajcawjlq
    ONTO m1chfnwt5fdfap4tlfjyzz34pcu67x6w5fo4eboiah4ql54ipv3pba
{
  ALTER TYPE default::Customer {
      CREATE PROPERTY stripe: std::str;
  };
};
