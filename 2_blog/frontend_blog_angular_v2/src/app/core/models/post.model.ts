import { CategoryResponse } from './category.model';
import { CommentResponse } from './comment.model';
import { TagResponse } from './tag.model';
import { UserResponse } from './user.model';

export type PostStatus = 'DRAFT' | 'PUBLISHED';

export interface PostSummaryResponse {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  category: CategoryResponse | null;
  tags: TagResponse[];
  status: PostStatus;
  viewCount: number;
  likeCount: number;
  featured: boolean;
  readingTimeMinutes: number;
  author: UserResponse | null;
  createdAt: string;
}

export interface PostResponse extends PostSummaryResponse {
  content: string;
  comments: CommentResponse[];
  updatedAt: string;
}

export interface PostRequest {
  title: string;
  content: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  categoryId: number | null;
  tagIds: number[];
  status: PostStatus;
  featured: boolean;
}
