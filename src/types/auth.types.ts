export type User = {
  id: string;
  email: string;
  role: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: string;
  user: User;
};

export type LoginCredentials = {
  email: string;
  password: string;
};