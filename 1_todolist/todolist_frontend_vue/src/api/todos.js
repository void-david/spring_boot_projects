const BASE = '/api/todos'

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) throw data  // validation errors are thrown as-is
  return data
}

export const todosApi = {
  getAll: () => request(BASE),
  filter: (completed) => request(`${BASE}/filter?completed=${completed}`),
  create: (body) => request(BASE, { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id) => request(`${BASE}/${id}`, { method: 'DELETE' }),
}
