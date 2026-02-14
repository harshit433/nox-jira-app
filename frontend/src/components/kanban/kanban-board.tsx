'use client';

import type { Issue } from '@/types';
import { KanbanColumn } from './kanban-column';

interface KanbanBoardProps {
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
  onAddIssue: (status: 'todo' | 'in_progress' | 'done') => void;
}

const COLUMNS: { status: 'todo' | 'in_progress' | 'done'; title: string }[] = [
  { status: 'todo', title: 'To Do' },
  { status: 'in_progress', title: 'In Progress' },
  { status: 'done', title: 'Done' },
];

export function KanbanBoard({ issues, onIssueClick, onAddIssue }: KanbanBoardProps) {
  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {COLUMNS.map(({ status, title }) => (
        <KanbanColumn
          key={status}
          status={status}
          title={title}
          issues={issues.filter((i) => i.status === status)}
          onIssueClick={onIssueClick}
          onAddIssue={onAddIssue}
        />
      ))}
    </div>
  );
}
