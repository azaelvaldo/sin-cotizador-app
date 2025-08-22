import { PaginationParams } from "./common.types";

export type StateFilters = PaginationParams & {
    search?: string;
  };
  
  export type State = {
    id: number;
    name: string;
    quotations?: unknown[]; // Will be properly typed in index.ts
  };