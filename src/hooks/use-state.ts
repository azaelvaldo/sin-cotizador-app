import { StateFilters } from '@/types/state.types';
import { fetchStates } from '@/services/state';
import { useQuery } from '@tanstack/react-query';
import { getAuthToken } from '@/lib/utils';

export default function useStates(filters?: StateFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['states', filters],
    queryFn: () =>
      fetchStates(filters, {
        Authorization: `Bearer ${getAuthToken()}`,
      }),
  });

  return { data, isLoading, error };
}
