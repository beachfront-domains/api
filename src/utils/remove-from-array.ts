


//  E X P O R T

export default (originalArray: any[], elementToRemove: any) => {
  let arr = originalArray;

  arr = arr.filter((item: any) => item !== elementToRemove);
  return arr;

  // return originalArray.filter(element => {
  //   return element !== elementToRemove;
  // });
};

// via https://stackoverflow.com/a/21688894
// removeFromArray([1, 2, 1, 0, 3, 1, 4], 1);
