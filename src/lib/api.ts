import type { Decision } from '@/core/validators/decision';
import type { DecisionRow } from '@/interfaces/decision';
import type { PlanRow } from '@/interfaces/plan';
import type { ResultRow } from '@/interfaces/result';
import type { TaskRow, TaskStatus, TaskType } from '@/interfaces/task';

/**
 * API Client for Aura MVP backend
 * Provides typed functions for all API endpoints
 */

const API_BASE = '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Tasks API
 */
export const tasksApi = {
  /**
   * List all tasks, optionally filtered by status or type
   */
  list: async (filters?: { status?: TaskStatus; type?: TaskType }): Promise<TaskRow[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);

    const query = params.toString();
    return fetchApi<TaskRow[]>(`/tasks${query ? `?${query}` : ''}`);
  },

  /**
   * Get a single task by ID
   */
  getById: async (id: string): Promise<TaskRow> => {
    return fetchApi<TaskRow>(`/tasks/${id}`);
  },

  /**
   * Create a new task
   */
  create: async (task: unknown): Promise<TaskRow> => {
    return fetchApi<TaskRow>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  /**
   * Update task status
   */
  updateStatus: async (id: string, status: TaskStatus): Promise<TaskRow> => {
    return fetchApi<TaskRow>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Delete a task
   */
  delete: async (id: string): Promise<void> => {
    await fetchApi<{ success: boolean }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Plans API
 */
export const plansApi = {
  /**
   * List plans, optionally filtered by status or taskId
   */
  list: async (filters?: { status?: string; taskId?: string }): Promise<PlanRow[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.taskId) params.append('taskId', filters.taskId);

    const query = params.toString();
    return fetchApi<PlanRow[]>(`/plans${query ? `?${query}` : ''}`);
  },

  /**
   * Get a single plan by ID
   */
  getById: async (id: string): Promise<PlanRow> => {
    return fetchApi<PlanRow>(`/plans/${id}`);
  },

  /**
   * Create a new plan
   */
  create: async (plan: unknown): Promise<PlanRow> => {
    return fetchApi<PlanRow>('/plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    });
  },

  /**
   * Update plan status
   */
  updateStatus: async (id: string, status: string): Promise<PlanRow> => {
    return fetchApi<PlanRow>(`/plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Delete a plan
   */
  delete: async (id: string): Promise<void> => {
    await fetchApi<{ success: boolean }>(`/plans/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Decisions API
 */
export const decisionsApi = {
  /**
   * List decisions, optionally filtered by category or taskId
   */
  list: async (filters?: { category?: string; taskId?: string }): Promise<DecisionRow[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.taskId) params.append('taskId', filters.taskId);

    const query = params.toString();
    return fetchApi<DecisionRow[]>(`/decisions${query ? `?${query}` : ''}`);
  },

  /**
   * Get a single decision by ID
   */
  getById: async (id: string): Promise<DecisionRow> => {
    return fetchApi<DecisionRow>(`/decisions/${id}`);
  },

  /**
   * Create a new decision
   */
  create: async (decision: unknown, decidedBy?: string): Promise<DecisionRow> => {
    return fetchApi<DecisionRow>('/decisions', {
      method: 'POST',
      body: JSON.stringify({ decision, decidedBy }),
    });
  },

  /**
   * Delete a decision
   */
  delete: async (id: string): Promise<void> => {
    await fetchApi<{ success: boolean }>(`/decisions/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Results API
 */
export const resultsApi = {
  /**
   * List results, optionally filtered by status or taskId
   */
  list: async (filters?: { status?: string; taskId?: string }): Promise<ResultRow[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.taskId) params.append('taskId', filters.taskId);

    const query = params.toString();
    return fetchApi<ResultRow[]>(`/results${query ? `?${query}` : ''}`);
  },

  /**
   * Get a single result by ID
   */
  getById: async (id: string): Promise<ResultRow> => {
    return fetchApi<ResultRow>(`/results/${id}`);
  },

  /**
   * Create a new result
   */
  create: async (result: unknown): Promise<ResultRow> => {
    return fetchApi<ResultRow>('/results', {
      method: 'POST',
      body: JSON.stringify(result),
    });
  },

  /**
   * Delete a result
   */
  delete: async (id: string): Promise<void> => {
    await fetchApi<{ success: boolean }>(`/results/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Workflow API
 */
export const workflowApi = {
  /**
   * Create a new task via workflow
   */
  createTask: async (task: unknown): Promise<{ taskId: string; status: string; message: string }> => {
    return fetchApi('/workflow/create-task', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  /**
   * Approve a plan and start execution
   */
  approvePlan: async (decision: Decision, decidedBy?: string): Promise<{ status: string; message: string; taskId: string }> => {
    return fetchApi('/workflow/approve-plan', {
      method: 'POST',
      body: JSON.stringify({ decision, decidedBy }),
    });
  },

  /**
   * Verify a result and complete the task
   */
  verifyResult: async (result: unknown): Promise<{ resultId: string; status: string; message: string; qualityGates?: unknown }> => {
    return fetchApi('/workflow/verify-result', {
      method: 'POST',
      body: JSON.stringify(result),
    });
  },
};

/**
 * Health API
 */
export const healthApi = {
  /**
   * Check API health
   */
  check: async (): Promise<{ status: string; timestamp: string; environment: string; version: string }> => {
    return fetchApi('/health');
  },

  /**
   * Check database health
   */
  dbCheck: async (): Promise<{ status: string; database: string; tables?: Record<string, number> }> => {
    return fetchApi('/db-health');
  },
};

