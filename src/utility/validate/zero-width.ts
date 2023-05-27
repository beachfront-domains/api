


/// export

export const zeroWidthRegex = /\u200a|\u200b|\u200c|\u200d|\u200e|\u200f/;
export default (providedString: string): boolean => zeroWidthRegex.test(providedString);
