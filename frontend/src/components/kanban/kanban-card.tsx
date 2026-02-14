'use client';

import type { Issue } from '@/types';

interface KanbanCardProps {
  issue: Issue;
  onClick: () => void;
}

export function KanbanCard({ issue, onClick }: KanbanCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-3 rounded-lg bg-white border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all group"
    >
      <span className="text-xs font-mono text-neutral-500">{issue.uniqueId}</span>
      <h4 className="font-medium text-neutral-900 mt-1 line-clamp-2 group-hover:text-neutral-700">
        {issue.title}
      </h4>
      <div className="flex items-center gap-2 mt-2">
        {issue.assignee && (
          <span className="text-xs text-neutral-500 truncate max-w-[120px]">
            {issue.assignee}
          </span>
        )}
        {issue.comments.length > 0 && (
          <span className="text-xs text-neutral-400">
            💬 {issue.comments.length}
          </span>
        )}
      </div>
    </button>
  );
}
