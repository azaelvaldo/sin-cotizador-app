'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchQuotations, createQuotation } from '@/services/quotation';
import { QuotationFilters, CreateQuotationInput } from '@/types/quotation.types';
import { getAuthToken } from '@/lib/utils';

export default function useQuotations(filters?: QuotationFilters) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'quotations',
      filters?.search,
      filters?.cropId,
      filters?.stateId,
      filters?.createdBy,
      filters?.dateRange?.start,
      filters?.dateRange?.end,
      filters?.insuredAmount,
      filters?.status,
      filters?.page,
      filters?.pageSize,
      filters?.sortKey,
      filters?.sortDirection,
    ],
    queryFn: () =>
      fetchQuotations(filters, {
        Authorization: `Bearer ${getAuthToken()}`,
      }),
    staleTime: 30_000,
  });

  const { mutate: createItem, isPending: createLoading } = useMutation({
    mutationKey: ['create-quotation'],
    mutationFn: (input: CreateQuotationInput) =>
      createQuotation(input, {
        Authorization: `Bearer ${getAuthToken()}`,
      }),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });

  return {
    quotations: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 0,
    pageSize: data?.pageSize || 10,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    refetch,
    createQuotation: createItem,
    createLoading,
  };
}
