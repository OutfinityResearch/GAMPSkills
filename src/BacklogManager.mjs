import { resolve } from 'path';
import * as CoreBacklogManager from 'achillesAgentLib/BacklogManager';

function getBacklogPath(type) {
  return resolve(`./${type}_backlog.backlog`);
}

export async function loadBacklog(type) {
  return await CoreBacklogManager.loadBacklog(getBacklogPath(type));
}

export async function createBacklog(type) {
  await CoreBacklogManager.createBacklog(getBacklogPath(type));
}

export async function getTask(type, taskIndex) {
  return await CoreBacklogManager.getTask(getBacklogPath(type), taskIndex);
}

export async function addOptionsFromText(type, taskIndex, text) {
  return await CoreBacklogManager.addOptionsFromText(getBacklogPath(type), taskIndex, text);
}

export async function addTasksFromText(type, text) {
  return await CoreBacklogManager.addTasksFromText(getBacklogPath(type), text);
}

export async function approveTask(type, taskIndex, resolution) {
  return await CoreBacklogManager.approveTask(getBacklogPath(type), taskIndex, resolution);
}

export async function getApprovedTasks(type) {
  return await CoreBacklogManager.getApprovedTasks(getBacklogPath(type));
}

export async function getNewTasks(type) {
  return await CoreBacklogManager.getNewTasks(getBacklogPath(type));
}

export async function markDone(type, taskIndex) {
  return await CoreBacklogManager.markDone(getBacklogPath(type), taskIndex);
}

export async function updateTask(type, taskIndex, updates) {
  await CoreBacklogManager.updateTask(getBacklogPath(type), taskIndex, updates);
}

export async function addTask(type, initialContent) {
  return await CoreBacklogManager.addTask(getBacklogPath(type), initialContent);
}
