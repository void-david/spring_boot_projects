export interface CommentResponse {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

export interface CommentRequest {
  author: string;
  content: string;
}
