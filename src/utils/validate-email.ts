


//  E X P O R T

export default (email: string) => {
  const emailRegex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\\.,;:\s@"]{2,})$/i;
  return emailRegex.test(String(email)); // eslint-disable-line padding-line-between-statements
};
