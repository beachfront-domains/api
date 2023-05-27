


/// util

// const alphanumericRegex = /^[a-zA-Z0-9]+$/;
// const numericalRegex = /^[0-9]+$/;



/// export

export default (suppliedString: string) => {
  if (suppliedString.length <= 8)
    return suppliedString;

  const firstFour = suppliedString.substr(0, 4);
  const lastFour = suppliedString.substr(-4);
  const masked = "*".repeat(suppliedString.length - 8);

  return `${firstFour}${masked}${lastFour}`;
}
