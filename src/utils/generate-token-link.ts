


//  E X P O R T

export default (baseUrl: string, token: string, email: string) => {
  // The ampersand is not escaped on purpose, error occurs otherwise
  return `${baseUrl}/access?token=${token}&uid=${encodeURIComponent(email)}`;
};
