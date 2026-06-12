import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoService } from './services/todo.service';
import { Todo } from './models/todo.model';
import { TodoCardComponent } from './components/todo-card/todo-card.component';
import { TodoFormModalComponent } from './components/todo-form-modal/todo-form-modal.component';

export type FilterType = 'all' | 'active' | 'done';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TodoCardComponent, TodoFormModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  todos    = signal<Todo[]>([]);
  filter   = signal<FilterType>('all');
  showModal   = signal(false);
  editingTodo = signal<Todo | null>(null);
  isLoading   = signal(true);
  errorMsg    = signal<string | null>(null);

  filteredTodos = computed(() => {
    const all = this.todos();
    switch (this.filter()) {
      case 'active': return all.filter(t => !t.completed);
      case 'done':   return all.filter(t =>  t.completed);
      default:       return all;
    }
  });

  activeCount = computed(() => this.todos().filter(t => !t.completed).length);
  doneCount   = computed(() => this.todos().filter(t =>  t.completed).length);

  constructor(private svc: TodoService) {}

  ngOnInit() { this.loadTodos(); }

  loadTodos() {
    this.isLoading.set(true);
    this.svc.getAll().subscribe({
      next: todos => { this.todos.set(todos); this.isLoading.set(false); },
      error: () => {
        this.errorMsg.set('Cannot reach the server — is Spring Boot running on port 8080?');
        this.isLoading.set(false);
      }
    });
  }

  setFilter(f: FilterType) { this.filter.set(f); }

  openModal(todo?: Todo) {
    this.editingTodo.set(todo ?? null);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingTodo.set(null);
  }

  onSaveTodo(data: Partial<Todo>) {
    const editing = this.editingTodo();
    if (editing?.id) {
      this.svc.update(editing.id, { ...editing, ...data }).subscribe(updated => {
        this.todos.update(ts => ts.map(t => t.id === updated.id ? updated : t));
        this.closeModal();
      });
    } else {
      this.svc.create(data).subscribe(created => {
        this.todos.update(ts => [created, ...ts]);
        this.closeModal();
      });
    }
  }

  onToggleComplete(todo: Todo) {
    this.svc.update(todo.id!, { ...todo, completed: !todo.completed }).subscribe(updated =>
      this.todos.update(ts => ts.map(t => t.id === updated.id ? updated : t))
    );
  }

  onDeleteTodo(id: number) {
    this.svc.delete(id).subscribe(() =>
      this.todos.update(ts => ts.filter(t => t.id !== id))
    );
  }

  dismissError() { this.errorMsg.set(null); }
}
