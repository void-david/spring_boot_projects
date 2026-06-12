export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type NoteColor = 'yellow' | 'blue' | 'pink' | 'green';

export interface Todo {
  id?: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  noteColor: NoteColor;
  createdAt?: string;
}
