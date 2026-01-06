
import * as fs from 'fs';
import * as path from 'path';
import { CommandExecutor } from '../sandbox/command-executor';

export interface ToolDefinition {
    name: string;
    description: string;
    args: Record<string, string>;
    execute: (args: any) => Promise<string>;
}

export const tools = {
    run_command: {
        name: 'run_command',
        description: 'Execute a shell command. Use this to read files (cat), list directories (ls), run tests, etc.',
        args: { command: 'string' },
        execute: async ({ command }: { command: string }) => {
            // Use existing CommandExecutor for safe execution
            const executor = new CommandExecutor({ cwd: process.cwd() });
            const result = await executor.execute(command);
            return result.success ? result.stdout : `Error: ${result.stderr}`;
        }
    },
    read_file: {
        name: 'read_file',
        description: 'Read the contents of a file.',
        args: { path: 'string' },
        execute: async ({ path: filePath }: { path: string }) => {
            try {
                const absolutePath = path.resolve(process.cwd(), filePath);
                return fs.readFileSync(absolutePath, 'utf8');
            } catch (e: any) {
                return `Error reading file: ${e.message}`;
            }
        }
    },
    list_dir: {
        name: 'list_dir',
        description: 'List contents of a directory. Returns names of files and folders.',
        args: { path: 'string' },
        execute: async ({ path: dirPath }: { path: string }) => {
            try {
                const absolutePath = path.resolve(process.cwd(), dirPath);
                const items = fs.readdirSync(absolutePath);
                // Classify as file or directory
                const result = items.map(item => {
                    try {
                        const stat = fs.statSync(path.join(absolutePath, item));
                        return `${item}${stat.isDirectory() ? '/' : ''}`;
                    } catch {
                        return item;
                    }
                });
                return result.join('\n');
            } catch (e: any) {
                return `Error listing directory: ${e.message}`;
            }
        }
    },
    search_code: {
        name: 'search_code',
        description: 'Search for string or pattern in codebase using grep.',
        args: { query: 'string', path: 'string' },
        execute: async ({ query, path: searchPath }: { query: string, path?: string }) => {
            const executor = new CommandExecutor({ cwd: process.cwd() });
            const target = searchPath || '.';
            // Use grep -r for recursive search, -n for line numbers, -I to ignore binary
            const cmd = `grep -rnI "${query}" ${target} | head -n 20`;
            const result = await executor.execute(cmd);
            return result.success ? result.stdout || 'No matches found' : `Error searching: ${result.stderr}`;
        }
    },
    write_file: {
        name: 'write_file',
        description: 'Write content to a file. Overwrites existing content. Ensure directory exists.',
        args: { path: 'string', content: 'string' },
        execute: async ({ path: filePath, content }: { path: string, content: string }) => {
            try {
                const absolutePath = path.resolve(process.cwd(), filePath);
                const dir = path.dirname(absolutePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.writeFileSync(absolutePath, content, 'utf8');
                return `Successfully wrote to ${filePath}`;
            } catch (e: any) {
                return `Error writing file: ${e.message}`;
            }
        }
    }
};

export function getToolDefinitions(): string {
    return Object.values(tools)
        .map(tool => `Tool: ${tool.name}\nDescription: ${tool.description}\nArgs: ${JSON.stringify(tool.args)}`)
        .join('\n\n');
}
