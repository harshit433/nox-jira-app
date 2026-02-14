export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Comment {
  id: string;
  text: string;
  authorEmail: string;
  timestamp: string;
}

export interface Issue {
  id: string;
  uniqueId: string;
  title: string;
  description: string;
  assignee: string | null;
  owner: string;
  status: 'todo' | 'in_progress' | 'done';
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateIssueInput {
  title: string;
  description?: string;
  assignee?: string;
  status?: 'todo' | 'in_progress' | 'done';
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  assignee?: string;
  status?: 'todo' | 'in_progress' | 'done';
}
