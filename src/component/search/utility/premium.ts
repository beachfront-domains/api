


/// util

const premiumDomains1 = [
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
];

const premiumDomains2 = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
];

const premiumDomains3 = [
  "am",
  "an",
  "and",
  "are",
  "as",
  "at",
  "but",
  "by",
  "can",
  "create",
  "day",
  "delete",
  "did",
  "do",
  "get",
  "go",
  "has",
  "he",
  "her",
  "him",
  "his",
  "how",
  "hq",
  "if",
  "in",
  "is",
  "it",
  "man",
  "me",
  "my",
  "no",
  "not",
  "now",
  "of",
  "on",
  "one",
  "or",
  "our",
  "out",
  "put",
  "read",
  "she",
  "so",
  "the",
  "to",
  "too",
  "two",
  "up",
  "update",
  "us",
  "was",
  "way",
  "we",
  "yes"
];



/// export

export default combineArrays(
  premiumDomains1,
  premiumDomains2,
  premiumDomains3
);



/// helper

function combineArrays<T>(...arrays: T[][]): T[] {
  return arrays.flat();
}
