export type QuotationFilters = {
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
  page?: number;
  pageSize?: number;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
};

export type Quotation = {
  id: string;
  // Add your actual quotation properties here
  [key: string]: unknown;
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
  insuredAmount: number;
  validityStart: string;
  validityEnd: string;
  geofence: Record<string, unknown>; // Replace with your actual geofence type
};

export type CreateQuotationResponse = {
  id: string;
  message: string;
  // Add other response properties as needed
};