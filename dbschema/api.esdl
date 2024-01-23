module api {
  type Key {
    required created: datetime {
      default := datetime_of_transaction();
      readonly := true;
    };
    required updated: datetime {
      default := datetime_of_transaction();
    };
    required url: str;
  }
}
