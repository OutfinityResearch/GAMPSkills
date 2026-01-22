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
  const lines = rawContent.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('### File: ')) {
      const fileKey = line.replace('### File: ', '').trim();
      let description = '';
      let status = '';
      const issues = [];
      const options = [];
      let resolution = '';

      let currentField = '';
      let issueId = 1;
      let optionId = 1;
      i++; // move to next line
      while (i < lines.length && !lines[i].startsWith('### File: ')) {
        const subline = lines[i];
        if (subline.startsWith('**Description:**')) {
          currentField = 'description';
          description = subline.replace('**Description:**', '').trim();
        } else if (subline.startsWith('**Status:**')) {
          currentField = 'status';
          status = subline.replace('**Status:**', '').trim();
        } else if (subline.startsWith('**Issues:**')) {
          currentField = 'issues';
        } else if (subline.startsWith('**Options:**')) {
          currentField = 'options';
        } else if (subline.startsWith('**Resolution:**')) {
          currentField = 'resolution';
          resolution = subline.replace('**Resolution:**', '').trim();
        } else if (currentField === 'issues' && /^\d+\./.test(subline)) {
          const item = parseNumberedItem(lines, i);
          issues.push({ id: issueId++, title: item.title, details: item.details, status: '' });
          i += item.consumed - 1;
        } else if (currentField === 'options' && /^\d+\./.test(subline)) {
          const item = parseNumberedItem(lines, i);
          options.push({ id: optionId++, title: item.title, details: item.details, status: '' });
          i += item.consumed - 1;
        } else if (currentField === 'description' && subline.trim()) {
          description += ' ' + subline.trim();
        } else if (currentField === 'resolution' && subline.trim()) {
          resolution += ' ' + subline.trim();
        }
        i++;
      }
      tasks[fileKey] = {
        name: fileKey,
        description: description.trim(),
        status,
        issues,
        options,
        resolution: resolution.trim()
      };
    } else {
      i++;
    }
  }
  return tasks;
}

function parseNumberedItem(lines, startIndex) {
  const firstLine = lines[startIndex];
  const match = firstLine.match(/^(\d+)\.\s*(.+)$/);
  if (!match) return { title: '', details: '', consumed: 1 };
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
  return { title, details: details.trim(), consumed };
}

export function render(tasks) {
  let content = '';
  for (const [fileKey, task] of Object.entries(tasks)) {
    content += `### File: ${fileKey}\n\n`;
    content += `**Description:** ${task.description}\n\n`;
    content += `**Status:** ${task.status}\n\n`;
    if (task.issues.length > 0) {
      content += '**Issues:**\n';
      for (const issue of task.issues) {
        content += `${issue.id}. ${issue.title}\n`;
        if (issue.details) {
          content += `   ${issue.details}\n`;
        }
      }
      content += '\n';
    }
    if (task.options.length > 0) {
      content += '**Options:**\n';
      for (const option of task.options) {
        content += `${option.id}. ${option.title}\n`;
        if (option.details) {
          content += `   ${option.details}\n`;
        }
      }
      content += '\n';
    }
    content += `**Resolution:** ${task.resolution}\n\n`;
  }
  return content.trim();
}

export function sliceToTask(rawContent, fileKey) {
  const tasks = rawContent.split(/^### File: /m);
  for (let i = 1; i < tasks.length; i++) {
    const task = tasks[i];
    const lines = task.split('\n');
    if (lines[0].trim() === fileKey) {
      return `### File: ${task.trim()}`;
    }
  }
  return '';
}

export function mergeTask(rawContent, taskText, fileKey) {
  const tasks = rawContent.split(/^### File: /m);
  let newContent = tasks[0]; // before first task

  for (let i = 1; i < tasks.length; i++) {
    const task = tasks[i];
    const lines = task.split('\n');
    if (lines[0].trim() === fileKey) {
      newContent += taskText.replace(/^### File: /, '');
    } else {
      newContent += `### File: ${task}`;
    }
  }

  return newContent;
}