import { PaginationParams } from "./common.types";

export type QuotationFilters = PaginationParams & {
  search?: string;
  cropId?: number;
  stateId?: number;
  createdBy?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  insuredAmount?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'review';
};

export type Quotation = {
  id: string;
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
  // Relations will be properly typed in index.ts
  createdByUser?: unknown;
  crop?: unknown;
  state?: unknown;
};

export type QuotationResponse = {
  data: Quotation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CreateQuotationInput = {
  clientName: string;
  cropId: number;
  stateId: number;
  insuredArea: number;
  insuredAmount: number;
  validityStart: string;
  validityEnd: string;
  geofence?: Record<string, unknown>;
};

export type CreateQuotationResponse = {
  id: number;
  message?: string;
  success: boolean;
};