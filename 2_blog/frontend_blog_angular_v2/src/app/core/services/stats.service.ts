import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE_URL = 'http://localhost:8080';

export interface BlogStats {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalCategories: number;
  totalTags: number;
  totalSubscribers: number;
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private http = inject(HttpClient);
  getStats(): Observable<BlogStats> {
    return this.http.get<BlogStats>(`${BASE_URL}/api/stats`);
  }
}
