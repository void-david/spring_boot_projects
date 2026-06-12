import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TagResponse, TagRequest } from '../models/tag.model';

const BASE_URL = 'http://localhost:8080';

@Injectable({ providedIn: 'root' })
export class TagService {
  private http = inject(HttpClient);

  getAllTags(): Observable<TagResponse[]> {
    return this.http.get<TagResponse[]>(`${BASE_URL}/api/tags`);
  }

  createTag(tag: TagRequest): Observable<TagResponse> {
    return this.http.post<TagResponse>(`${BASE_URL}/api/tags`, tag);
  }

  updateTag(id: number, tag: TagRequest): Observable<TagResponse> {
    return this.http.put<TagResponse>(`${BASE_URL}/api/tags/${id}`, tag);
  }

  deleteTag(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE_URL}/api/tags/${id}`);
  }
}
