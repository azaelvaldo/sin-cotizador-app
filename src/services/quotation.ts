import { QuotationFilters, QuotationResponse, CreateQuotationInput, CreateQuotationResponse } from '@/types/quotation.types';

export async function fetchQuotations(filters?: QuotationFilters, extraHeaders?: HeadersInit): Promise<QuotationResponse> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.cropId) params.append('cropId', filters.cropId.toString());
  if (filters?.stateId) params.append('stateId', filters.stateId.toString());
  if (filters?.createdBy) params.append('createdBy', filters.createdBy);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.insuredAmount) params.append('insuredAmount', filters.insuredAmount.toString());
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
  if (filters?.sortKey) params.append('sortKey', filters.sortKey);
  if (filters?.sortDirection) params.append('sortDirection', filters.sortDirection);
  if (filters?.dateRange?.start) {
    params.append('startDate', filters.dateRange.start.toISOString());
  }
  if (filters?.dateRange?.end) {
    params.append('endDate', filters.dateRange.end.toISOString());
  }
  const url = `http://localhost:4000/quotations${params.toString() ? `?${params.toString()}` : ''}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...extraHeaders
  };
  
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function createQuotation(input: CreateQuotationInput, extraHeaders?: HeadersInit): Promise<CreateQuotationResponse> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...extraHeaders
  };

  const response = await fetch('http://localhost:4000/quotations', {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
