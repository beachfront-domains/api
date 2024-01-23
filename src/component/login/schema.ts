


/// export

export interface Login {
  for: string; // customer ID
  link: string;
  token: string;
  ///
  created: Date;
  id: string;
  updated: Date;
}

export interface LoginCreate {
  params: {
    email: string;
  }
}

export interface LoginRequest {
  params: {
    email?: string;
    id?: string;
  }
}



/// be sure to keep this file in sync with `/schema/login.graphql`
