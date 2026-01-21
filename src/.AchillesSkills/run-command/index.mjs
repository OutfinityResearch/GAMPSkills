import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export async function action(context) {
    const { command, cwd } = context;
    if (!command) {
        throw new Error('Invalid input for run-command: expected command.');
    }
    const execOptions = cwd ? { cwd: String(cwd).trim() } : undefined;
    const { stdout, stderr } = await execAsync(String(command), execOptions);
    const exitCode = 0; // Assume success, or check process.exitCode
    return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode };
}
