import { CropFilters } from '@/types/crop.types';
import { fetchCrops } from '@/services/crop';
import { useQuery } from '@tanstack/react-query';
import { getAuthToken } from '@/lib/utils';

export default function useCrops(filters?: CropFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['crops', filters],
    queryFn: () =>
      fetchCrops(filters, {
        Authorization: `Bearer ${getAuthToken()}`,
      }),
  });

  return { data, isLoading, error };
}
