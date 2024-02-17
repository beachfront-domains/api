


/// import

import { Big } from "dep/x/big.ts";

/// util

import type { BagItem } from "src/bag/schema.ts";



/// export

export function calculatePrice(duration: number, price: string) {
  if (duration < 2 || duration > 10)
    throw new Error("Duration must be between 2 and 10");

  if (isNaN(Number(price)))
    throw new Error("Price must be a valid number");

  const multiplier = (duration / 2);
  return new Big(price).times(multiplier).toFixed(2);

  /// improved via ChatGPT 4
}

export function totalPrice(bag: BagItem[]): number {
  return bag.reduce((total, item) => {
    const itemPrice = parseFloat(calculatePrice(item.duration, item.price));
    return total + (isNaN(itemPrice) ? 0 : itemPrice);
  }, 0).toFixed(2);

  /// improved via ChatGPT 4
}



/// old

// export function calculatePrice(duration: number, price: string) {
//   switch(true) {
//     case duration === 2: {
//       return new Big(price).toFixed(2);
//     }

//     case duration === 4: {
//       return new Big(price).times(2).toFixed(2);
//     }

//     case duration === 6: {
//       return new Big(price).times(3).toFixed(2);
//     }

//     case duration === 8: {
//       return new Big(price).times(4).toFixed(2);
//     }

//     case duration === 10:
//     default: {
//       return new Big(price).times(5).toFixed(2);
//     }
//   }
// }

// export function totalPrice(bag: any[]) {
//   let total = 0;

//   bag.map(item => {
//     total += parseFloat(calculatePrice(item.duration, item.price));
//   });

//   return total;
// }
