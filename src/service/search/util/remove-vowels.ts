


///  E X P O R T

export default (suppliedString: string): string => {
  return String(suppliedString).replace(/[aeiou]/gi, "");
}
