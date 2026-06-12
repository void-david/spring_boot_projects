import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo } from '../models/todo.model';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly api = 'http://localhost:8080/api/todos';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.api);
  }

  create(todo: Partial<Todo>): Observable<Todo> {
    return this.http.post<Todo>(this.api, todo);
  }

  update(id: number, todo: Partial<Todo>): Observable<Todo> {
    return this.http.put<Todo>(`${this.api}/${id}`, todo);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
