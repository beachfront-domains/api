CREATE MIGRATION m1ahf24aoiiecmy43gxn57pcfrgoqppxcdyjw2snfp2kw3gc6ge5lq
    ONTO m1i5lessra4zyczm2c5qdhyftfjckpuaxoopze6pmsihjplrkbdmpa
{
  ALTER TYPE default::Bag {
      CREATE PROPERTY bag: array<tuple<duration: std::int16, name: std::str, price: std::str>>;
  };
};
