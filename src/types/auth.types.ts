import { Quotation } from "./quotation.types";

export type Role = 'ADMIN' | 'USER';

export type User = {
  id: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  quoteRequests?: Quotation[];
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
