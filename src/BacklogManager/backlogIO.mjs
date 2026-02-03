import { readFile, writeFile } from 'fs/promises';

export async function readBacklog(path) {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read backlog: ${error.message}`);
  }
}

export async function writeBacklog(path, content) {
  try {
    await writeFile(path, content, 'utf8');
  } catch (error) {
    throw new Error(`Failed to write backlog: ${error.message}`);
  }
}

export function parse(rawContent) {
  const tasks = {};
  const history = [];
  const lines = rawContent.split('\n');
  let i = 0;
  let inHistory = false;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '# History') {
      inHistory = true;
      i++;
      continue;
    }

    const headerMatch = line.match(/^##\s+(\d+)\s*$/);
    if (headerMatch) {
      const taskId = headerMatch[1];
      let description = '';
      const options = [];
      let resolution = '';

      let currentField = '';
      i++;
      while (i < lines.length && !lines[i].match(/^##\s+\d+\s*$/) && lines[i].trim() !== '# History') {
        const subline = lines[i];
        if (subline.startsWith('**Description:**')) {
          currentField = 'description';
          description = subline.replace('**Description:**', '').trim();
        } else if (subline.startsWith('**Status:**')) {
          currentField = 'status';
        } else if (subline.startsWith('**Options:**')) {
          currentField = 'options';
        } else if (subline.startsWith('**Resolution:**')) {
          currentField = 'resolution';
          resolution = subline.replace('**Resolution:**', '').trim();
        } else if (currentField === 'options' && /^\d+\./.test(subline)) {
          const item = parseNumberedItem(lines, i);
          options.push({ id: item.id, title: item.title, details: item.details, status: '' });
          i += item.consumed - 1;
        } else if (currentField === 'description' && subline.trim()) {
          description += ' ' + subline.trim();
        } else if (currentField === 'resolution' && subline.trim()) {
          resolution += ' ' + subline.trim();
        }
        i++;
      }

      const task = {
        id: parseInt(taskId, 10),
        description: description.trim(),
        options,
        resolution: resolution.trim()
      };

      if (inHistory) {
        history.push(task);
      } else {
        tasks[taskId] = task;
      }
    } else {
      i++;
    }
  }
  return { tasks, history };
}

function parseNumberedItem(lines, startIndex) {
  const firstLine = lines[startIndex];
  const match = firstLine.match(/^(\d+)\.\s*(.+)$/);
  if (!match) return { id: 1, title: '', details: '', consumed: 1 };
  const id = Number.parseInt(match[1], 10);
  const title = match[2];
  let details = '';
  let consumed = 1;
  for (let j = startIndex + 1; j < lines.length; j++) {
    const nextLine = lines[j];
    if (nextLine.startsWith('   ') || nextLine.startsWith('\t')) {
      details += nextLine.trim() + '\n';
      consumed++;
    } else {
      break;
    }
  }
  return { id, title, details: details.trim(), consumed };
}

export function render(input) {
  const tasks = input?.tasks ?? input ?? {};
  const history = input?.history ?? [];
  let content = '';
  const sortedIds = Object.keys(tasks)
    .map((key) => Number.parseInt(key, 10))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b)
    .map((value) => String(value));

  for (const taskId of sortedIds) {
    const task = tasks[taskId];
    const resolution = (task.resolution ?? '').trim();
    content += `## ${taskId}\n\n`;
    content += `**Description:** ${task.description}\n\n`;
    if (resolution) {
      content += `**Resolution:** ${resolution}\n\n`;
    } else {
      content += '**Options:**\n';
      if (task.options?.length > 0) {
        for (const option of task.options) {
          content += `${option.id}. ${option.title}\n`;
          if (option.details) {
            content += `   ${option.details}\n`;
          }
        }
      }
      content += '\n';
    }
  }

  if (history.length > 0) {
    if (content) {
      content += '\n';
    }
    content += '# History\n\n';
    for (let index = 0; index < history.length; index += 1) {
      const task = history[index];
      const resolution = (task.resolution ?? '').trim();
      content += `## ${index + 1}\n\n`;
      content += `**Description:** ${task.description}\n\n`;
      content += `**Resolution:** ${resolution}\n\n`;
    }
  }

  return content.trim();
}

export function sliceToTask(rawContent, taskId) {
  const { activeContent } = splitHistory(rawContent);
  const tasks = activeContent.split(/^##\s+/m);
  for (let i = 1; i < tasks.length; i++) {
    const task = tasks[i];
    const lines = task.split('\n');
    if (lines[0].trim() === String(taskId)) {
      return `## ${task.trim()}`;
    }
  }
  return '';
}

export function mergeTask(rawContent, taskText, taskId) {
  const { activeContent, historyContent } = splitHistory(rawContent);
  const tasks = activeContent.split(/^##\s+/m);
  let newContent = tasks[0]; // before first task

  for (let i = 1; i < tasks.length; i++) {
    const task = tasks[i];
    const lines = task.split('\n');
    if (lines[0].trim() === String(taskId)) {
      newContent += taskText.replace(/^##\s+/, '');
    } else {
      newContent += `## ${task}`;
    }
  }

  if (historyContent.trim()) {
    newContent = `${newContent.trim()}\n\n# History\n${historyContent.trim()}\n`;
  }

  return newContent;
}

function splitHistory(rawContent) {
  const parts = rawContent.split(/^#\s+History\s*$/m);
  const activeContent = parts[0] ?? '';
  const historyContent = parts[1] ?? '';
  return { activeContent, historyContent };
}
