/**
 * Command Executor
 *
 * Safely executes shell commands with timeout, output capture,
 * and security restrictions.
 */

import { spawn, type ChildProcess } from 'child_process';

// ============================================================================
// Types
// ============================================================================

export interface CommandResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
  timedOut: boolean;
}

export interface CommandOptions {
  /** Working directory */
  cwd?: string;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Environment variables */
  env?: Record<string, string>;
  /** Max output buffer size in bytes */
  maxBuffer?: number;
}

// Dangerous commands that should never be executed
const BLOCKED_PATTERNS = [
  /rm\s+-rf\s+\/(?!\w)/,      // rm -rf /
  /rm\s+-rf\s+~\//,            // rm -rf ~/
  /rm\s+-rf\s+\*$/,            // rm -rf *
  /mkfs\./,                    // mkfs.* commands
  /dd\s+if=.*of=\/dev\//,      // dd to block devices
  /:\(\)\{\s*:\|:\s*&\s*\}/,   // Fork bombs
  />\s*\/dev\/sd[a-z]/,        // Writing to block devices
  /chmod\s+-R\s+777\s+\//,     // chmod 777 on root
  /curl.*\|\s*bash/,           // curl | bash
  /wget.*\|\s*bash/,           // wget | bash
];

// ============================================================================
// Command Executor
// ============================================================================

export class CommandExecutor {
  private defaultOptions: CommandOptions;

  constructor(options: CommandOptions = {}) {
    this.defaultOptions = {
      cwd: options.cwd || process.cwd(),
      timeout: options.timeout || 60000, // 1 minute default
      env: options.env,
      maxBuffer: options.maxBuffer || 5 * 1024 * 1024, // 5MB
    };
  }

  /**
   * Execute a shell command safely
   */
  async execute(command: string, options: CommandOptions = {}): Promise<CommandResult> {
    const opts = { ...this.defaultOptions, ...options };
    const timeout = opts.timeout || 60000;
    const maxBuffer = opts.maxBuffer || 5 * 1024 * 1024;
    const startTime = Date.now();

    // Security check
    const securityIssue = this.checkCommand(command);
    if (securityIssue) {
      return {
        success: false,
        exitCode: 126, // Command cannot execute
        stdout: '',
        stderr: `Security: ${securityIssue}`,
        duration: 0,
        timedOut: false,
      };
    }

    return new Promise((resolve) => {
      const stdout: string[] = [];
      const stderr: string[] = [];
      let timedOut = false;

      // Split command for spawn (shell mode)
      const proc: ChildProcess = spawn('sh', ['-c', command], {
        cwd: opts.cwd,
        env: opts.env ? { ...process.env, ...opts.env } : undefined,
      });

      // Timeout handler
      const timeoutId = setTimeout(() => {
        timedOut = true;
        proc.kill('SIGTERM');
        // Force kill after 5 seconds if still running
        setTimeout(() => proc.kill('SIGKILL'), 5000);
      }, timeout);

      // Capture stdout
      proc.stdout?.on('data', (data: Buffer) => {
        const chunk = data.toString();
        stdout.push(chunk);
        // Truncate if too large
        if (stdout.join('').length > maxBuffer) {
          stdout.length = 0;
          stdout.push('[Output truncated - exceeded max buffer]\n');
        }
      });

      // Capture stderr
      proc.stderr?.on('data', (data: Buffer) => {
        const chunk = data.toString();
        stderr.push(chunk);
        if (stderr.join('').length > maxBuffer) {
          stderr.length = 0;
          stderr.push('[Output truncated - exceeded max buffer]\n');
        }
      });

      // Handle process exit
      proc.on('close', (code: number | null) => {
        clearTimeout(timeoutId);
        const duration = Math.round((Date.now() - startTime) / 1000);

        resolve({
          success: code === 0 && !timedOut,
          exitCode: timedOut ? 124 : (code ?? 1),
          stdout: stdout.join(''),
          stderr: stderr.join(''),
          duration,
          timedOut,
        });
      });

      proc.on('error', (error: Error) => {
        clearTimeout(timeoutId);
        const duration = Math.round((Date.now() - startTime) / 1000);

        resolve({
          success: false,
          exitCode: 127, // Command not found
          stdout: stdout.join(''),
          stderr: error.message,
          duration,
          timedOut: false,
        });
      });
    });
  }

  /**
   * Check command for security issues
   */
  private checkCommand(command: string): string | null {
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(command)) {
        return `Command matches blocked pattern: ${pattern.source}`;
      }
    }

    // Check for shell escapes
    if (command.includes('$(') && command.includes('rm ')) {
      return 'Suspicious command substitution with rm';
    }

    return null;
  }

  /**
   * Execute multiple commands in sequence
   * Stops on first failure
   */
  async executeSequence(
    commands: string[],
    options: CommandOptions = {}
  ): Promise<{ results: CommandResult[]; allSucceeded: boolean }> {
    const results: CommandResult[] = [];

    for (const command of commands) {
      const result = await this.execute(command, options);
      results.push(result);

      if (!result.success) {
        return { results, allSucceeded: false };
      }
    }

    return { results, allSucceeded: true };
  }

  /**
   * Execute a command and return just stdout (convenience method)
   */
  async run(command: string, options: CommandOptions = {}): Promise<string> {
    const result = await this.execute(command, options);
    if (!result.success) {
      throw new Error(result.stderr || `Command failed with exit code ${result.exitCode}`);
    }
    return result.stdout;
  }
}

/**
 * Create a command executor with default options
 */
export function createCommandExecutor(options?: CommandOptions): CommandExecutor {
  return new CommandExecutor(options);
}

/**
 * Default command executor instance
 */
export const commandExecutor = new CommandExecutor();
