'use client';

import type { Issue } from '@/types';
import { KanbanCard } from './kanban-card';

interface KanbanColumnProps {
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
  onAddIssue?: (status: 'todo' | 'in_progress' | 'done') => void;
}

export function KanbanColumn({
  title,
  status,
  issues,
  onIssueClick,
  onAddIssue,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col w-80 flex-shrink-0 rounded-lg border border-neutral-200 bg-neutral-50/50">
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <h3 className="font-semibold text-neutral-900">{title}</h3>
        <span className="text-sm text-neutral-500 bg-neutral-200 px-2 py-0.5 rounded-full">
          {issues.length}
        </span>
      </div>
      <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[200px] max-h-[calc(100vh-280px)]">
        {issues.map((issue) => (
          <KanbanCard
            key={issue.id}
            issue={issue}
            onClick={() => onIssueClick(issue)}
          />
        ))}
        {onAddIssue && (
          <button
            type="button"
            onClick={() => onAddIssue(status)}
            className="w-full py-2 rounded-md border-2 border-dashed border-neutral-300 text-neutral-500 hover:border-neutral-400 hover:text-neutral-600 transition-colors text-sm font-medium"
          >
            + Add issue
          </button>
        )}
      </div>
    </div>
  );
}
