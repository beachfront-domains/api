"use strict";



//  U T I L S

// import { User } from "../user/types";

type Registrar = {
  email: string;
  id: string;
  name: string;
  url: string;
}



//  E X P O R T S

export type DomainType = {
  created: number;
  // dnssec: string,
  expires: number;
  id: string;
  name: string;
  nameservers: string[];
  owner: string;
  records: string[];
  registrar: Registrar;
  renews: number;
  status: string;
  updated: number;
  wishlist: boolean;
}

export type DomainInputType = {
  details: {
    // created: RDatum<Date>,
    // dnssec: string,
    expires: number;
    id: string;
    name: string;
    nameservers: string[];
    renews: number;
    status: string;
    // updated: number,
    wishlist: boolean;
  };
  owner: string;
}
