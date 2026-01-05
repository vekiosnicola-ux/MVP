/**
 * Sandbox Module
 *
 * Provides safe execution environment for AI-generated code:
 * - Git snapshots for rollback
 * - Safe command execution with security checks
 */

export {
  GitSnapshotManager,
  createSnapshotManager,
  type Snapshot,
  type SnapshotResult,
  type RollbackResult,
} from './git-snapshot';

export {
  CommandExecutor,
  createCommandExecutor,
  commandExecutor,
  type CommandResult,
  type CommandOptions,
} from './command-executor';
