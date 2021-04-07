


///  I M P O R T

import print from "@webb/console";



///  E X P O R T

export const printError = (suppliedString: string): void => {
  console.error(
    "\n" +
    print.redLine(print.black(" beachfront ")) +
    print.invert(` ${suppliedString} `)
  );
};

export const printInfo = (suppliedString: string): void => {
  console.info(
    print.grayLine(print.black(" beachfront ")) +
    print.invert(` ${suppliedString} `)
  );
};

export const printSuccess = (suppliedString: string): void => {
  console.log(
    print.greenLine(print.black(" beachfront ")) +
    print.invert(` ${suppliedString} `)
  );
};
