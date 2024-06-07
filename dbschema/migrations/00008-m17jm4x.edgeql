CREATE MIGRATION m17jm4x3kpnxel4moqn7arlswgfcwozimara6k7nxdrvdjlktfzzlq
    ONTO m14tdtkyblrbcxbc7njm3ddkb2amsjvv3hj6cgd7ymqllj6ldxw47q
{
  CREATE TYPE default::Session EXTENDING default::BaseRecord {
      CREATE REQUIRED LINK `for`: default::Customer;
      CREATE PROPERTY device: std::str;
      CREATE PROPERTY expires: std::datetime;
      CREATE PROPERTY ip: std::str;
      CREATE PROPERTY nickname: std::str;
      CREATE REQUIRED PROPERTY token: std::str;
  };
};
