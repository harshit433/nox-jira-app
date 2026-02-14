'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { issuesApi } from '@/lib/api';
import type { Issue } from '@/types';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import { IssueModal } from '@/components/issues/issue-modal';
import { Button } from '@/components/ui/button';

export function Dashboard() {
  const { user, signout } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: 'create' | 'edit' | 'view';
    issue: Issue | null;
    status?: 'todo' | 'in_progress' | 'done';
  }>({ open: false, mode: 'view', issue: null });

  const fetchIssues = useCallback(async () => {
    try {
      const data = await issuesApi.list();
      setIssues(data);
    } catch {
      setIssues([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  function openCreate(status: 'todo' | 'in_progress' | 'done') {
    setModalState({ open: true, mode: 'create', issue: null, status });
  }

  function openView(issue: Issue) {
    setModalState({ open: true, mode: 'view', issue });
  }

  function openEdit(issue: Issue) {
    setModalState({ open: true, mode: 'edit', issue });
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              NoX
            </h1>
            <span className="text-sm text-neutral-500">Kanban</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-pulse text-neutral-500">Loading board...</div>
          </div>
        ) : (
          <KanbanBoard
            issues={issues}
            onIssueClick={openView}
            onAddIssue={openCreate}
          />
        )}
      </main>

      {modalState.open && (
        <IssueModal
          issue={modalState.issue}
          mode={modalState.mode}
          status={modalState.status}
          onClose={() => setModalState((s) => ({ ...s, open: false }))}
          onSaved={fetchIssues}
          onEdit={(i) => setModalState({ open: true, mode: 'edit', issue: i })}
        />
      )}
    </div>
  );
}
