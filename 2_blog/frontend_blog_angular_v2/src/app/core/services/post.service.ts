import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PostSummaryResponse, PostResponse, PostRequest } from '../models/post.model';
import { Page } from '../models/page.model';

const BASE_URL = 'http://localhost:8080';

@Injectable({ providedIn: 'root' })
export class PostService {
  private http = inject(HttpClient);

  getAllPosts(page = 0, size = 10): Observable<Page<PostSummaryResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<PostSummaryResponse>>(`${BASE_URL}/api/posts`, { params });
  }

  getFeaturedPosts(): Observable<PostSummaryResponse[]> {
    return this.http.get<PostSummaryResponse[]>(`${BASE_URL}/api/posts/featured`);
  }

  searchPosts(q: string, page = 0, size = 10): Observable<Page<PostSummaryResponse>> {
    const params = new HttpParams().set('q', q).set('page', page).set('size', size);
    return this.http.get<Page<PostSummaryResponse>>(`${BASE_URL}/api/posts/search`, { params });
  }

  getPostById(id: number): Observable<PostResponse> {
    return this.http.get<PostResponse>(`${BASE_URL}/api/posts/${id}`);
  }

  getPostBySlug(slug: string): Observable<PostResponse> {
    return this.http.get<PostResponse>(`${BASE_URL}/api/posts/slug/${slug}`);
  }

  getPostsByCategory(categoryId: number, page = 0, size = 10): Observable<Page<PostSummaryResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<PostSummaryResponse>>(`${BASE_URL}/api/posts/category/${categoryId}`, { params });
  }

  getPostsByTag(tagId: number, page = 0, size = 10): Observable<Page<PostSummaryResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<PostSummaryResponse>>(`${BASE_URL}/api/posts/tag/${tagId}`, { params });
  }

  createPost(post: PostRequest): Observable<PostResponse> {
    return this.http.post<PostResponse>(`${BASE_URL}/api/posts`, post);
  }

  updatePost(id: number, post: PostRequest): Observable<PostResponse> {
    return this.http.put<PostResponse>(`${BASE_URL}/api/posts/${id}`, post);
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE_URL}/api/posts/${id}`);
  }

  recordView(id: number): Observable<void> {
    return this.http.post<void>(`${BASE_URL}/api/posts/${id}/view`, {});
  }

  likePost(id: number): Observable<void> {
    return this.http.post<void>(`${BASE_URL}/api/posts/${id}/like`, {});
  }
}
