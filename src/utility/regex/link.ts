


///  E X P O R T

export default (providedString: string): boolean => {
  return new RegExp(/(^https?:\/\/.*?)(\S+)|(^https?:\/\/.*?)$/, "i").test(providedString);
};
