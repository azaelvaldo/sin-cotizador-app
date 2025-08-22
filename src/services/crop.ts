import { PaginatedResponse } from '@/types/common.types';
import { Crop, CropFilters } from '@/types/crop.types';

export async function fetchCrops(
  filters?: CropFilters,
  extraHeaders?: HeadersInit
): Promise<PaginatedResponse<Crop>> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
  if (filters?.sortKey) params.append('sortKey', filters.sortKey);
  if (filters?.sortDirection) params.append('sortDirection', filters.sortDirection);
  const url = `http://localhost:4000/crops${params.toString() ? `?${params.toString()}` : ''}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...extraHeaders,
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
