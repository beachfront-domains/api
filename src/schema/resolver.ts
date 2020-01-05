"use strict";



//  U T I L S

import {
  createDomain,
  deleteDomain,
  getDomain,
  getDomains,
  updateDomain
} from "~module/domain/query";

import {
  deleteUser,
  exportUser,
  getUser,
  getUsers,
  updateUser
} from "~module/user/query";

import {
  initSession,
  login,
  validateAccess
} from "~module/login/query";



//  E X P O R T

export default () => {
  return {
    authenticate: validateAccess,
    createSession: initSession,
    login,

    createDomain,
    deleteDomain,
    domain: getDomain,
    domainss: getDomains,
    updateDomain,

    deleteUser,
    exportUser,
    user: getUser,
    // userByEmail: getUser,
    // userByRole: getUser,
    // userByUsername: getUser,
    users: getUsers,
    updateUser
  };
};
