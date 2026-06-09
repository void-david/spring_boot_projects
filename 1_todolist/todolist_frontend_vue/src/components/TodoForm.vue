<script setup>
import { ref, reactive } from 'vue'
import { todosApi } from '../api/todos.js'

const emit = defineEmits(['created'])

const form = reactive({ title: '', description: '' })
const errors = reactive({ title: '', description: '' })
const submitting = ref(false)

async function submit() {
  errors.title = ''
  errors.description = ''

  if (!form.title.trim()) {
    errors.title = 'Title cannot be blank'
    return
  }

  submitting.value = true
  try {
    const created = await todosApi.create({
      title: form.title.trim(),
      description: form.description.trim(),
    })
    form.title = ''
    form.description = ''
    emit('created', created)
  } catch (e) {
    if (e && typeof e === 'object') {
      if (e.title) errors.title = e.title
      if (e.description) errors.description = e.description
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="todo-form" @submit.prevent="submit" novalidate>
    <div class="field">
      <input
        v-model="form.title"
        :class="{ error: errors.title }"
        type="text"
        placeholder="What needs to be done?"
        aria-label="Todo title"
        autocomplete="off"
        :disabled="submitting"
      />
      <p v-if="errors.title" class="field-error">{{ errors.title }}</p>
    </div>

    <div class="field">
      <textarea
        v-model="form.description"
        :class="{ error: errors.description }"
        placeholder="Description (optional)"
        aria-label="Todo description"
        rows="2"
        :disabled="submitting"
      />
      <p v-if="errors.description" class="field-error">{{ errors.description }}</p>
    </div>

    <button type="submit" class="btn-primary" :disabled="submitting">
      {{ submitting ? 'Adding…' : '+ Add Todo' }}
    </button>
  </form>
</template>

<style scoped>
.todo-form {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

input, textarea {
  width: 100%;
  padding: 10px 12px;
  font-size: 0.925rem;
}

textarea { resize: vertical; min-height: 56px; }

.field-error {
  font-size: 0.8rem;
  color: var(--error-text);
}

.btn-primary {
  align-self: flex-end;
  padding: 9px 20px;
  font-size: 0.875rem;
  font-weight: 600;
  background: var(--primary);
  color: #fff;
}

.btn-primary:not(:disabled):hover {
  background: var(--primary-hover);
}
</style>
