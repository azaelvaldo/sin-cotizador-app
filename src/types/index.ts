// Re-export all types from their respective files
export * from './auth.types';
export * from './common.types';
export * from './crop.types';
export * from './quotation.types';
export * from './state.types';

// Core entity types without relations to avoid circular dependencies
export type BaseUser = {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: Date;
  updatedAt: Date;
};

export type BaseCrop = {
  id: number;
  name: string;
};

export type BaseState = {
  id: number;
  name: string;
};

export type BaseQuotation = {
  id: number;
  clientName: string;
  cropId: number;
  stateId: number;
  insuredArea: number;
  insuredAmount: number;
  validityStart: Date;
  validityEnd: Date;
  status: string;
  geofence?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
};

// Extended types with relations
export type User = BaseUser & {
  quoteRequests?: BaseQuotation[];
};

export type Crop = BaseCrop & {
  quotations?: BaseQuotation[];
};

export type State = BaseState & {
  quotations?: BaseQuotation[];
};

export type Quotation = BaseQuotation & {
  createdByUser?: BaseUser;
  crop?: BaseCrop;
  state?: BaseState;
};

export type Alert = {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  read: boolean
  createdAt: Date
}