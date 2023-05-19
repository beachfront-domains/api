


/// export

export function validateDate(suppliedDate: string): boolean {
  // TODO
  // : ensure `argument` is not a date in the past
  // : ensure `argument` is at least a year into the future
  // : new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toJSON(); (adds two years to current date)
  // : make ^ a new function, with an option to include years, increments +1 by default

  if (isFinite(new Date(suppliedDate)))
    return true;
  else
    return false;
}



/// via https://stackoverflow.com/a/67410020
