export interface CursorPage<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface Sort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface Range {
  from: number;
  to: number;
}

export interface Pagination {
  page: number;
  limit: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
