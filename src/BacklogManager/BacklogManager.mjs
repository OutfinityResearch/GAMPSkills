import { resolve } from 'path';
import * as CoreBacklogManager from 'achillesAgentLib/BacklogManager';

export async function loadBacklog(type) {
  const backlogPath = resolve(`./${type}_backlog.backlog`);
  return await CoreBacklogManager.loadBacklog(backlogPath);
}

export async function createBacklog(type) {
  const backlogPath = resolve(`./${type}_backlog.backlog`);
  await CoreBacklogManager.createBacklog(backlogPath);
}

export async function getTask(type, taskIndex) {
  const backlogPath = resolve(`./${type}_backlog.backlog`);
  return await CoreBacklogManager.getTask(backlogPath, taskIndex);
}

export async function addOptionsFromText(type, taskIndex, text) {
  const backlogPath = resolve(`./${type}_backlog.backlog`);
  return await CoreBacklogManager.addOptionsFromText(backlogPath, taskIndex, text);
}

export async function addTasksFromText(type, text) {
  const backlogPath = resolve(`./${type}_backlog.backlog`);
  return await CoreBacklogManager.addTasksFromText(backlogPath, text);
}

export async function approveTask(type, taskIndex, resolution) {
  const backlogPath = resolve(`./${type}_backlog.backlog`);
  return await CoreBacklogManager.approveTask(backlogPath, taskIndex, resolution);
}

export async function getApprovedTasks(type) {
  const backlogPath = resolve(`./${type}_backlog.backlog`);
  return await CoreBacklogManager.getApprovedTasks(backlogPath);
}

export async function getNewTasks(type) {
  const backlogPath = resolve(`./${type}_backlog.backlog`);
  return await CoreBacklogManager.getNewTasks(backlogPath);
}

export async function markDone(type, taskIndex) {
  const backlogPath = resolve(`./${type}_backlog.backlog`);
  return await CoreBacklogManager.markDone(backlogPath, taskIndex);
}

export async function updateTask(type, taskIndex, updates) {
  const backlogPath = resolve(`./${type}_backlog.backlog`);
  await CoreBacklogManager.updateTask(backlogPath, taskIndex, updates);
}

export async function addTask(type, initialContent) {
  const backlogPath = resolve(`./${type}_backlog.backlog`);
  return await CoreBacklogManager.addTask(backlogPath, initialContent);
}
