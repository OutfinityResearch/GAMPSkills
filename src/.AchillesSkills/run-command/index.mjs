import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export async function action(context) {
    const { prompt } = context;
    const match = prompt.match(/command:\s*(.+),\s*cwd:\s*(.+)/);
    if (!match) throw new Error('Invalid prompt format for run-command: expected "command: cmd, cwd: /path"');
    const command = match[1].trim();
    const cwd = match[2].trim();
    const { stdout, stderr } = await execAsync(command, { cwd });
    const exitCode = 0; // Assume success, or check process.exitCode
    return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode };
}