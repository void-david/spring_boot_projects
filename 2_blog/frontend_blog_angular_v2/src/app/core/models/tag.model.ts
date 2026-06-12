export interface TagResponse {
  id: number;
  name: string;
  color: string | null;
}

export interface TagRequest {
  name: string;
  color?: string | null;
}
