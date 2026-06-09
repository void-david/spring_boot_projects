<script setup>
import { ref, computed, onMounted } from 'vue'
import { todosApi } from './api/todos.js'
import TodoForm from './components/TodoForm.vue'
import TodoItem from './components/TodoItem.vue'

const todos = ref([])
const filter = ref('all')   // 'all' | 'active' | 'completed'
const loading = ref(false)
const globalError = ref('')

async function loadTodos() {
  loading.value = true
  globalError.value = ''
  try {
    if (filter.value === 'all') {
      todos.value = await todosApi.getAll()
    } else {
      todos.value = await todosApi.filter(filter.value === 'completed')
    }
  } catch {
    globalError.value = 'Failed to load todos.'
  } finally {
    loading.value = false
  }
}

function handleCreated(todo) {
  if (filter.value === 'all' || filter.value === 'active') {
    todos.value.unshift(todo)
  }
}

function handleUpdated(updated) {
  const idx = todos.value.findIndex(t => t.id === updated.id)
  if (idx !== -1) {
    if (filter.value === 'all') {
      todos.value[idx] = updated
    } else {
      const keep =
        (filter.value === 'completed' && updated.completed) ||
        (filter.value === 'active' && !updated.completed)
      if (keep) todos.value[idx] = updated
      else todos.value.splice(idx, 1)
    }
  }
}

function handleDeleted(id) {
  todos.value = todos.value.filter(t => t.id !== id)
}

const counts = computed(() => ({
  all: todos.value.length,
  active: todos.value.filter(t => !t.completed).length,
  completed: todos.value.filter(t => t.completed).length,
}))

onMounted(loadTodos)
</script>

<template>
  <div class="app-wrap">
    <header>
      <h1>Todos</h1>
      <p class="subtitle">Stay on top of what matters.</p>
    </header>

    <main>
      <TodoForm @created="handleCreated" />

      <div class="filters" role="tablist" aria-label="Filter todos">
        <button
          v-for="tab in ['all', 'active', 'completed']"
          :key="tab"
          role="tab"
          :aria-selected="filter === tab"
          :class="['filter-btn', { active: filter === tab }]"
          @click="filter = tab; loadTodos()"
        >
          {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
          <span class="count">{{ counts[tab] }}</span>
        </button>
      </div>

      <p v-if="globalError" class="global-error">{{ globalError }}</p>

      <div v-if="loading" class="state-msg">Loading…</div>

      <ul v-else-if="todos.length" class="todo-list">
        <TodoItem
          v-for="todo in todos"
          :key="todo.id"
          :todo="todo"
          @updated="handleUpdated"
          @deleted="handleDeleted"
        />
      </ul>

      <div v-else class="state-msg">
        {{ filter === 'all' ? 'No todos yet. Add one above!' : `No ${filter} todos.` }}
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-wrap {
  max-width: 640px;
  margin: 0 auto;
  padding: 48px 16px 80px;
}

header {
  text-align: center;
  margin-bottom: 40px;
}

h1 {
  font-size: 2.25rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: var(--text);
}

.subtitle {
  margin-top: 6px;
  color: var(--text-muted);
  font-size: 0.95rem;
}

.filters {
  display: flex;
  gap: 6px;
  margin: 24px 0 16px;
}

.filter-btn {
  flex: 1;
  padding: 8px 12px;
  font-size: 0.875rem;
  font-weight: 500;
  background: var(--surface);
  color: var(--text-muted);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.filter-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.filter-btn:not(.active):hover {
  border-color: var(--primary);
  color: var(--text);
}

.count {
  font-size: 0.75rem;
  padding: 1px 7px;
  border-radius: 20px;
  background: rgba(255,255,255,0.25);
}

.filter-btn:not(.active) .count {
  background: var(--border);
  color: var(--text-muted);
}

.todo-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.state-msg {
  text-align: center;
  color: var(--text-muted);
  padding: 48px 0;
  font-size: 0.95rem;
}

.global-error {
  color: var(--error-text);
  background: var(--error-bg);
  border-radius: var(--radius);
  padding: 10px 14px;
  font-size: 0.875rem;
  margin-bottom: 12px;
}
</style>
