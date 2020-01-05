"use strict";



//  U T I L S

enum UserLoginMethod {
  Link = "Link",
  Token = "Token"
}

enum UserRole {
  Admin = "Admin",
  User = "User"
}

enum UserType {
  Organization = "Organization",
  User = "User"
}

type UserCounts = {
  domains: number;
  wishlist: number;
}



//  E X P O R T

export type User = {
  company: string;
  counts: UserCounts;
  created: number;
  email: string;
  id: string;
  language: string;
  login: string;
  loginMethod: string;
  name: string;
  role: UserRole;
  type: UserType;
  updated: number;
};
