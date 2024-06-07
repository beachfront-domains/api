CREATE MIGRATION m1qqxq4mnghb4ly7pw6g5mn7gqtl57kpjspzjro2a2jzgl2n6ebkyq
    ONTO m162vs2tvitm6w4xvly6ptpvs3oobafrcl2lyqiqtnb6wsydgaeujq
{
  CREATE TYPE default::Login EXTENDING default::BaseRecord {
      CREATE REQUIRED LINK `for`: default::Customer;
      CREATE REQUIRED PROPERTY token: std::str;
  };
};
