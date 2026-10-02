/** Uniform result returned by server actions and route handlers. */
export type ActionResult<T = undefined> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
}
