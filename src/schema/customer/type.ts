


///  E X P O R T

export type Customer = {
  email: string;
  loginMethod: "link" | "token";
  name: string;
  role: "admin" | "customer";
  staff: boolean;
  stripeId: string;
  timezone: string;
  username: string;
  verified: boolean;
  ///
  created: string;
  id: string;
  updated: string;
};



/// be sure to keep this file in sync with `schema/customer.graphql`
