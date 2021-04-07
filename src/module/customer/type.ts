


///  U T I L

type Login = {
  browser: string
  date: string
  device: string
  location: string
};



///  E X P O R T

export type Customer = {
  avatar: string
  bio: string
  email: string
  homepage: string
  id: string
  language: string
  location: string
  loginMethod: "link" | "token"
  logins: Login[]
  name: string
  pronoun: string
  role: "admin" | "customer"
  staff: boolean
  timezone: string
  username: string
  verified: boolean
  //
  created: string
  updated: string
};
