import { PaginationParams } from './common.types';
import { Quotation } from './quotation.types';

export type CropFilters = PaginationParams & {
  search?: string;
};

export type Crop = {
  id: number;
  name: string;
  quotations?: Quotation[]; // Will be properly typed in index.ts
};
