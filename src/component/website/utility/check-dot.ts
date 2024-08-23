


/// export

export default function (str: string): boolean {
  const index = str.indexOf(".");

  return index !== -1 &&
    index !== 0 &&
    index !== str.length - 1;
}
