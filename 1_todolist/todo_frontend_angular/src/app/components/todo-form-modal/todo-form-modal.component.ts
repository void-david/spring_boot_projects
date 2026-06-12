import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Todo, Priority, NoteColor } from '../../models/todo.model';

@Component({
  selector: 'app-todo-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-form-modal.component.html',
  styleUrl: './todo-form-modal.component.scss'
})
export class TodoFormModalComponent implements OnInit {
  @Input() todo: Todo | null = null;

  @Output() save   = new EventEmitter<Partial<Todo>>();
  @Output() cancel = new EventEmitter<void>();

  title       = '';
  description = '';
  priority: Priority  = 'MEDIUM';
  noteColor: NoteColor = 'yellow';

  readonly priorities: Priority[]   = ['LOW', 'MEDIUM', 'HIGH'];
  readonly colors: { value: NoteColor; label: string }[] = [
    { value: 'yellow', label: 'Honey'  },
    { value: 'blue',   label: 'Sky'    },
    { value: 'pink',   label: 'Rose'   },
    { value: 'green',  label: 'Mint'   }
  ];

  get isEditing(): boolean { return !!this.todo?.id; }

  ngOnInit() {
    if (this.todo) {
      this.title       = this.todo.title;
      this.description = this.todo.description ?? '';
      this.priority    = this.todo.priority;
      this.noteColor   = this.todo.noteColor;
    }
  }

  onSubmit() {
    const trimmed = this.title.trim();
    if (!trimmed) return;
    this.save.emit({
      title:       trimmed,
      description: this.description.trim() || undefined,
      priority:    this.priority,
      noteColor:   this.noteColor,
      completed:   this.todo?.completed ?? false
    });
  }

  onOverlayClick(e: Event) {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
      this.cancel.emit();
    }
  }
}
