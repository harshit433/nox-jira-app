'use client';

import { useState, useEffect } from 'react';
import type { Issue, CreateIssueInput } from '@/types';
import { issuesApi, usersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface IssueModalProps {
  issue?: Issue | null;
  mode: 'create' | 'edit' | 'view';
  status?: 'todo' | 'in_progress' | 'done';
  onClose: () => void;
  onSaved: () => void;
  onEdit?: (issue: Issue) => void;
}

export function IssueModal({
  issue,
  mode,
  status = 'todo',
  onClose,
  onSaved,
  onEdit,
}: IssueModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [issueStatus, setIssueStatus] = useState<'todo' | 'in_progress' | 'done'>(status);
  const [commentText, setCommentText] = useState('');
  const [users, setUsers] = useState<Array<{ id: string; email: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = mode === 'edit';
  const isCreate = mode === 'create';
  const isView = mode === 'view';

  useEffect(() => {
    if (issue) {
      setTitle(issue.title);
      setDescription(issue.description);
      setAssignee(issue.assignee || '');
      setIssueStatus(issue.status);
    } else if (isCreate) {
      setIssueStatus(status);
    }
  }, [issue, isCreate, status]);

  useEffect(() => {
    usersApi.list().then(setUsers).catch(() => setUsers([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isCreate) {
        const input: CreateIssueInput = {
          title,
          description: description || undefined,
          assignee: assignee || undefined,
          status: issueStatus,
        };
        await issuesApi.create(input);
      } else if (issue && isEdit) {
        await issuesApi.update(issue.id, {
          title,
          description,
          assignee: assignee || undefined,
          status: issueStatus,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!issue || !confirm('Delete this issue?')) return;
    setLoading(true);
    try {
      await issuesApi.delete(issue.id);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!issue || !commentText.trim()) return;
    setLoading(true);
    try {
      await issuesApi.addComment(issue.id, commentText.trim());
      setCommentText('');
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!issue) return;
    try {
      await issuesApi.deleteComment(issue.id, commentId);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
    }
  }

  const displayIssue = issue || {
    uniqueId: '—',
    owner: '',
    comments: [],
    createdAt: '',
    updatedAt: '',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isCreate ? 'Create issue' : isEdit ? 'Edit issue' : displayIssue.uniqueId}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 text-2xl leading-none"
          >
            ×
          </button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Issue title"
                required
                disabled={isView}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Issue description"
                rows={3}
                disabled={isView}
                className="w-full px-3 py-2 rounded-md border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent disabled:opacity-50 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Assignee
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                disabled={isView}
                className="w-full h-10 px-3 rounded-md border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.email}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            {!isView && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Status
                </label>
                <select
                  value={issueStatus}
                  onChange={(e) =>
                    setIssueStatus(e.target.value as 'todo' | 'in_progress' | 'done')
                  }
                  className="w-full h-10 px-3 rounded-md border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            )}

            {isView && issue && onEdit && (
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => onEdit(issue)}>
                  Edit
                </Button>
              </div>
            )}

            {!isView && (
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : isCreate ? 'Create' : 'Save'}
                </Button>
                {isEdit && issue && (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
          </form>

          {!isCreate && (
            <>
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <p className="text-xs text-neutral-500">
                  Owner: {displayIssue.owner} · Created{' '}
                  {displayIssue.createdAt
                    ? new Date(displayIssue.createdAt).toLocaleString()
                    : '—'}
                </p>
              </div>

              <div className="mt-6">
                <h3 className="font-medium text-neutral-900 mb-2">Comments</h3>
                <div className="space-y-3">
                  {displayIssue.comments?.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-md bg-neutral-50 border border-neutral-100"
                    >
                      <p className="text-sm text-neutral-700">{c.text}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-neutral-500">
                          {c.authorEmail} · {new Date(c.timestamp).toLocaleString()}
                        </span>
                        {!isView && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(c.id)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {!isView && (
                  <form onSubmit={handleAddComment} className="mt-3 flex gap-2">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 h-10 px-3 rounded-md border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                    <Button type="submit" disabled={loading || !commentText.trim()}>
                      Add
                    </Button>
                  </form>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
