import { CategoryResponse } from './category.model';
import { CommentResponse } from './comment.model';

export interface PostSummaryResponse {
  id: number;
  title: string;
  category: CategoryResponse;
  createdAt: string;
}

export interface PostResponse {
  id: number;
  title: string;
  content: string;
  category: CategoryResponse;
  comments: CommentResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface PostRequest {
  title: string;
  content: string;
  categoryId: number;
  tagIds: number[];
}
