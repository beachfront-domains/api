


/// import

import { Big } from "dep/x/big.ts";



/// export

export default (duration, price) => {
  switch(true) {
    case duration === 2:
      return new Big(price).toFixed(2);

    case duration === 4:
      return new Big(price).times(2).toFixed(2);

    case duration === 6:
      return new Big(price).times(3).toFixed(2);

    case duration === 8:
      return new Big(price).times(4).toFixed(2);

    case duration === 10:
    default:
      return new Big(price).times(5).toFixed(2);
  }
};
