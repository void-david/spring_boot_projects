import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Todo } from '../../models/todo.model';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

const ROTATIONS = [-3, -1.5, 2, -2.5, 1, 3, -1, 2.5, -0.5, 1.8];

@Component({
  selector: 'app-todo-card',
  standalone: true,
  imports: [CommonModule, TimeAgoPipe],
  templateUrl: './todo-card.component.html',
  styleUrl: './todo-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoCardComponent {
  @Input({ required: true }) todo!: Todo;

  @Output() toggleComplete = new EventEmitter<Todo>();
  @Output() editTodo       = new EventEmitter<Todo>();
  @Output() deleteTodo     = new EventEmitter<number>();

  get rotation(): string {
    const idx = (this.todo.id ?? 0) % ROTATIONS.length;
    return `${ROTATIONS[idx]}deg`;
  }

  get priorityLabel(): string {
    const map = { LOW: 'Low', MEDIUM: 'Med', HIGH: 'High' };
    return map[this.todo.priority] ?? '';
  }

  onToggle(e: Event) {
    e.stopPropagation();
    this.toggleComplete.emit(this.todo);
  }

  onEdit() {
    this.editTodo.emit(this.todo);
  }

  onDelete(e: Event) {
    e.stopPropagation();
    this.deleteTodo.emit(this.todo.id!);
  }
}
