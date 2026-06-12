import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommentResponse, CommentRequest } from '../models/comment.model';

const BASE_URL = 'http://localhost:8080';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private http = inject(HttpClient);

  createComment(postId: number, comment: CommentRequest): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(`${BASE_URL}/api/posts/${postId}/comments`, comment);
  }

  deleteComment(postId: number, commentId: number): Observable<void> {
    return this.http.delete<void>(`${BASE_URL}/api/posts/${postId}/comments/${commentId}`);
  }
}
