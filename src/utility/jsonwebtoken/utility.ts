


/// import

import ms from "ms";



/// export

export function timespan(time, iat) {
  const timestamp = iat || Math.floor(Date.now() / 1000);

  if (typeof time === "string") {
    const milliseconds = ms(time);

    if (typeof milliseconds === "undefined")
      return;

    return Math.floor(timestamp + milliseconds / 1000);
  }

  if (typeof time === "number")
    return timestamp + time;
  else
    return;
};
