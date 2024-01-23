


/// export

export const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export default (providedString: string): boolean => uuidRegex.test(providedString);



/// via https://github.com/afram/is-uuid/blob/master/lib/is-uuid.js
