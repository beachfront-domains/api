CREATE MIGRATION m1i5lessra4zyczm2c5qdhyftfjckpuaxoopze6pmsihjplrkbdmpa
    ONTO m1r7vja4qogj5e6zotw6oe7morsvawtihl45klunqmcysbshgdyd2a
{
  ALTER TYPE default::Bag {
      DROP PROPERTY bag;
  };
};
