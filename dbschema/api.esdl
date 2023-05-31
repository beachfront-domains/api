module api {
  type Key {
    required property created -> datetime {
      default := datetime_of_transaction();
      readonly := true;
    };
    required property updated -> datetime {
      default := datetime_of_transaction();
    };
    required property url -> str;
  }
}
