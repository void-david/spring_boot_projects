<script setup>
import { ref, reactive } from 'vue'
import { todosApi } from '../api/todos.js'

const props = defineProps({ todo: { type: Object, required: true } })
const emit = defineEmits(['updated', 'deleted'])

const editing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const form = reactive({ title: '', description: '' })
const errors = reactive({ title: '', description: '' })

function startEdit() {
  form.title = props.todo.title
  form.description = props.todo.description ?? ''
  errors.title = ''
  errors.description = ''
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

async function saveEdit() {
  errors.title = ''
  errors.description = ''

  if (!form.title.trim()) {
    errors.title = 'Title cannot be blank'
    return
  }

  saving.value = true
  try {
    const updated = await todosApi.update(props.todo.id, {
      title: form.title.trim(),
      description: form.description.trim(),
      completed: props.todo.completed,
    })
    editing.value = false
    emit('updated', updated)
  } catch (e) {
    if (e && typeof e === 'object') {
      if (e.title) errors.title = e.title
      if (e.description) errors.description = e.description
    }
  } finally {
    saving.value = false
  }
}

async function toggleComplete() {
  try {
    const updated = await todosApi.update(props.todo.id, {
      title: props.todo.title,
      description: props.todo.description ?? '',
      completed: !props.todo.completed,
    })
    emit('updated', updated)
  } catch { /* silent */ }
}

async function handleDelete() {
  deleting.value = true
  try {
    await todosApi.remove(props.todo.id)
    emit('deleted', props.todo.id)
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <li :class="['todo-item', { completed: todo.completed, editing }]">

    <!-- View mode -->
    <template v-if="!editing">
      <button
        class="check-btn"
        :aria-label="todo.completed ? 'Mark incomplete' : 'Mark complete'"
        :aria-pressed="todo.completed"
        @click="toggleComplete"
      >
        <svg v-if="todo.completed" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
      </button>

      <div class="todo-body">
        <span class="todo-title">{{ todo.title }}</span>
        <span v-if="todo.description" class="todo-desc">{{ todo.description }}</span>
      </div>

      <div class="todo-actions">
        <button class="action-btn edit-btn" aria-label="Edit todo" @click="startEdit">
          <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
          </svg>
        </button>
        <button
          class="action-btn delete-btn"
          aria-label="Delete todo"
          :disabled="deleting"
          @click="handleDelete"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    </template>

    <!-- Edit mode -->
    <template v-else>
      <div class="edit-form">
        <div class="field">
          <input
            v-model="form.title"
            :class="{ error: errors.title }"
            type="text"
            placeholder="Title"
            aria-label="Edit title"
            :disabled="saving"
          />
          <p v-if="errors.title" class="field-error">{{ errors.title }}</p>
        </div>
        <div class="field">
          <textarea
            v-model="form.description"
            :class="{ error: errors.description }"
            placeholder="Description (optional)"
            aria-label="Edit description"
            rows="2"
            :disabled="saving"
          />
          <p v-if="errors.description" class="field-error">{{ errors.description }}</p>
        </div>
        <div class="edit-actions">
          <button class="btn-ghost" :disabled="saving" @click="cancelEdit">Cancel</button>
          <button class="btn-primary" :disabled="saving" @click="saveEdit">
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </div>
    </template>

  </li>
</template>

<style scoped>
.todo-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: var(--shadow);
  transition: border-color 0.15s;
}

.todo-item:hover {
  border-color: color-mix(in srgb, var(--primary) 40%, var(--border));
}

.todo-item.editing {
  padding: 16px;
}

.check-btn {
  flex-shrink: 0;
  margin-top: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: border-color 0.15s, background 0.15s;
  color: #fff;
}

.check-btn:hover {
  border-color: var(--success);
  background: color-mix(in srgb, var(--success) 15%, transparent);
}

.todo-item.completed .check-btn {
  border-color: var(--success);
  background: var(--success);
}

.todo-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.todo-title {
  font-size: 0.925rem;
  font-weight: 500;
  line-height: 1.4;
  word-break: break-word;
}

.todo-item.completed .todo-title {
  text-decoration: line-through;
  color: var(--text-muted);
}

.todo-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.5;
  word-break: break-word;
}

.todo-actions {
  flex-shrink: 0;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s;
}

.todo-item:hover .todo-actions,
.todo-item:focus-within .todo-actions {
  opacity: 1;
}

.action-btn {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: var(--text-muted);
}

.edit-btn:hover { background: var(--border); color: var(--text); }
.delete-btn:hover { background: var(--error-bg); color: var(--danger); }

.edit-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

input, textarea {
  width: 100%;
  padding: 8px 10px;
  font-size: 0.875rem;
}

textarea { resize: vertical; min-height: 52px; }

.field-error {
  font-size: 0.78rem;
  color: var(--error-text);
}

.edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-primary {
  padding: 7px 16px;
  font-size: 0.875rem;
  font-weight: 600;
  background: var(--primary);
  color: #fff;
}

.btn-primary:not(:disabled):hover { background: var(--primary-hover); }

.btn-ghost {
  padding: 7px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.btn-ghost:not(:disabled):hover {
  background: var(--border);
  color: var(--text);
}
</style>
