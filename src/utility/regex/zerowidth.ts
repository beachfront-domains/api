


///  E X P O R T

export default (providedString: string): boolean => {
  return new RegExp(/\u200a|\u200b|\u200c|\u200d|\u200e|\u200f/).test(providedString);
};
