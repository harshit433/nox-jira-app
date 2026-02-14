import { API_BASE_URL, TOKEN_KEY } from '@/lib/constants';
import type { User, Issue, CreateIssueInput, UpdateIssueInput } from '@/types';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return data as T;
}

export const authApi = {
  signin: (email: string, password: string) =>
    request<{ token: string; user: User; expiresAt: string }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (email: string, password: string, name: string) =>
    request<{ token: string; user: User; expiresAt: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  signout: () => request<{ success: boolean }>('/auth/signout', { method: 'POST' }),

  me: () => request<{ user: User }>('/auth/me'),
};

export const issuesApi = {
  list: () => request<Issue[]>('/issues'),

  get: (id: string) => request<Issue>(`/issues/${id}`),

  create: (input: CreateIssueInput) =>
    request<Issue>('/issues', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: string, input: UpdateIssueInput) =>
    request<Issue>(`/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  delete: (id: string) =>
    request<{ success: boolean }>(`/issues/${id}`, { method: 'DELETE' }),

  addComment: (issueId: string, text: string) =>
    request<{ id: string; text: string; authorEmail: string; timestamp: string }>(
      `/issues/${issueId}/comments`,
      {
        method: 'POST',
        body: JSON.stringify({ text }),
      }
    ),

  deleteComment: (issueId: string, commentId: string) =>
    request<{ success: boolean }>(
      `/issues/${issueId}/comments/${commentId}`,
      { method: 'DELETE' }
    ),
};

export const usersApi = {
  list: () =>
    request<Array<{ id: string; email: string; name: string }>>('/users'),
};
