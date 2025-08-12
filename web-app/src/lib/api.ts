export const api = {
  get: (p: string, init?: RequestInit) => fetch(`/api${p}`, { ...init }),
  post: (p: string, body?: any) =>
    fetch(`/api${p}`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: body ? JSON.stringify(body) : undefined 
    }),
  put: (p: string, body?: any) =>
    fetch(`/api${p}`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: body ? JSON.stringify(body) : undefined 
    }),
  delete: (p: string) => fetch(`/api${p}`, { method: 'DELETE' }),
};
