/**
 * Git Snapshot Manager
 *
 * Creates snapshots of git repository state before execution
 * and provides rollback capability on failure.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ============================================================================
// Types
// ============================================================================

export interface Snapshot {
  id: string;
  branchName: string;
  commitHash: string;
  stashRef?: string;
  createdAt: string;
  workingDir: string;
}

export interface SnapshotResult {
  success: boolean;
  snapshot?: Snapshot;
  error?: string;
}

export interface RollbackResult {
  success: boolean;
  error?: string;
}

// ============================================================================
// Git Snapshot Manager
// ============================================================================

export class GitSnapshotManager {
  private workingDir: string;
  private snapshots: Map<string, Snapshot> = new Map();

  constructor(workingDir: string) {
    this.workingDir = workingDir;
  }

  /**
   * Create a snapshot of current git state
   * Stashes any uncommitted changes and records current HEAD
   */
  async createSnapshot(taskId: string): Promise<SnapshotResult> {
    try {
      // Check if we're in a git repo
      await this.execGit('rev-parse --git-dir');

      // Get current branch and commit
      const branchName = await this.getCurrentBranch();
      const commitHash = await this.getCurrentCommit();

      // Stash any uncommitted changes
      const stashRef = await this.stashChanges(taskId);

      const snapshot: Snapshot = {
        id: `snapshot-${taskId}-${Date.now()}`,
        branchName,
        commitHash,
        stashRef,
        createdAt: new Date().toISOString(),
        workingDir: this.workingDir,
      };

      this.snapshots.set(snapshot.id, snapshot);

      // eslint-disable-next-line no-console
      console.log(`[GitSnapshot] Created snapshot ${snapshot.id}`);
      // eslint-disable-next-line no-console
      console.log(`  Branch: ${branchName}, Commit: ${commitHash.slice(0, 8)}`);
      if (stashRef) {
        // eslint-disable-next-line no-console
        console.log(`  Stashed changes: ${stashRef}`);
      }

      return { success: true, snapshot };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[GitSnapshot] Failed to create snapshot: ${message}`);
      return { success: false, error: message };
    }
  }

  /**
   * Rollback to a previous snapshot
   * Discards all changes since snapshot and restores stashed changes
   */
  async rollback(snapshotId: string): Promise<RollbackResult> {
    const snapshot = this.snapshots.get(snapshotId);
    if (!snapshot) {
      return { success: false, error: `Snapshot not found: ${snapshotId}` };
    }

    try {
      // eslint-disable-next-line no-console
      console.log(`[GitSnapshot] Rolling back to ${snapshotId}`);

      // Discard all uncommitted changes
      await this.execGit('checkout -- .');
      await this.execGit('clean -fd');

      // Reset to snapshot commit (soft reset to preserve history)
      await this.execGit(`reset --hard ${snapshot.commitHash}`);

      // Checkout the original branch
      await this.execGit(`checkout ${snapshot.branchName}`);

      // Restore stashed changes if any
      if (snapshot.stashRef) {
        try {
          await this.execGit(`stash pop ${snapshot.stashRef}`);
          // eslint-disable-next-line no-console
          console.log(`[GitSnapshot] Restored stashed changes`);
        } catch {
          // Stash may have been dropped or conflict
          // eslint-disable-next-line no-console
          console.warn(`[GitSnapshot] Could not restore stash: ${snapshot.stashRef}`);
        }
      }

      // eslint-disable-next-line no-console
      console.log(`[GitSnapshot] Rollback complete`);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[GitSnapshot] Rollback failed: ${message}`);
      return { success: false, error: message };
    }
  }

  /**
   * Discard a snapshot (no rollback needed - execution succeeded)
   */
  async discardSnapshot(snapshotId: string): Promise<void> {
    const snapshot = this.snapshots.get(snapshotId);
    if (!snapshot) return;

    // Drop the stash if we created one
    if (snapshot.stashRef) {
      try {
        await this.execGit(`stash drop ${snapshot.stashRef}`);
      } catch {
        // Stash may already be gone
      }
    }

    this.snapshots.delete(snapshotId);
    // eslint-disable-next-line no-console
    console.log(`[GitSnapshot] Discarded snapshot ${snapshotId}`);
  }

  /**
   * Get current branch name
   */
  private async getCurrentBranch(): Promise<string> {
    const result = await this.execGit('rev-parse --abbrev-ref HEAD');
    return result.trim();
  }

  /**
   * Get current commit hash
   */
  private async getCurrentCommit(): Promise<string> {
    const result = await this.execGit('rev-parse HEAD');
    return result.trim();
  }

  /**
   * Stash uncommitted changes if any
   */
  private async stashChanges(taskId: string): Promise<string | undefined> {
    // Check if there are changes to stash
    const status = await this.execGit('status --porcelain');
    if (!status.trim()) {
      return undefined; // No changes to stash
    }

    // Create stash with task ID in message
    const stashMessage = `pre-execution-${taskId}`;
    await this.execGit(`stash push -m "${stashMessage}"`);

    // Get the stash reference
    const stashList = await this.execGit('stash list -n 1');
    const match = stashList.match(/^(stash@\{\d+\})/);
    return match ? match[1] : 'stash@{0}';
  }

  /**
   * Execute a git command
   */
  private async execGit(command: string): Promise<string> {
    const { stdout } = await execAsync(`git ${command}`, {
      cwd: this.workingDir,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });
    return stdout;
  }

  /**
   * Check if working directory has uncommitted changes
   */
  async hasUncommittedChanges(): Promise<boolean> {
    const status = await this.execGit('status --porcelain');
    return status.trim().length > 0;
  }

  /**
   * Get list of files changed since snapshot
   */
  async getChangedFiles(snapshotId: string): Promise<string[]> {
    const snapshot = this.snapshots.get(snapshotId);
    if (!snapshot) return [];

    try {
      const diff = await this.execGit(`diff --name-only ${snapshot.commitHash}`);
      return diff.split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }
}

/**
 * Create a snapshot manager for a directory
 */
export function createSnapshotManager(workingDir: string): GitSnapshotManager {
  return new GitSnapshotManager(workingDir);
}
