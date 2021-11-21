


///  I M P O R T

import Big from "big.js";



///  E X P O R T

export default (suppliedDuration, suppliedPrice) => {
  switch(true) {
    case suppliedDuration === 2:
      return new Big(suppliedPrice).toFixed(2);

    case suppliedDuration === 4:
      return new Big(suppliedPrice).times(2).toFixed(2);

    case suppliedDuration === 6:
      return new Big(suppliedPrice).times(3).toFixed(2);

    case suppliedDuration === 8:
      return new Big(suppliedPrice).times(4).toFixed(2);

    case suppliedDuration === 10:
    default:
      return new Big(suppliedPrice).times(5).toFixed(2);
  }
};
