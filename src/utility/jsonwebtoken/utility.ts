


///  I M P O R T

import ms from "ms";



///  E X P O R T

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
