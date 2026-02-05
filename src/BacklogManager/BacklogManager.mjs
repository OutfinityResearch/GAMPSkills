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

export async function getTask(type, taskId) {
  const backlogPath = resolve(`./${type}_backlog.backlog`);
  return await CoreBacklogManager.getTask(backlogPath, taskId);
}

export async function addOptionsFromText(type, taskId, text) {
  const backlogPath = resolve(`./${type}_backlog.backlog`);
  return await CoreBacklogManager.addOptionsFromText(backlogPath, taskId, text);
}

export async function approveOption(type, taskId, optionIndex) {
  const backlogPath = resolve(`./${type}_backlog.backlog`);
  return await CoreBacklogManager.approveOption(backlogPath, taskId, optionIndex);
}

export async function saveBacklog(type, data) {
  const backlogPath = resolve(`./${type}_backlog.backlog`);
  await CoreBacklogManager.saveBacklog(backlogPath, data);
}

export async function getApprovedTasks(type) {
  const backlogPath = resolve(`./${type}_backlog.backlog`);
  return await CoreBacklogManager.getApprovedTasks(backlogPath);
}

export async function getNewTasks(type) {
  const backlogPath = resolve(`./${type}_backlog.backlog`);
  return await CoreBacklogManager.getNewTasks(backlogPath);
}

export async function markDone(type, taskId) {
  const backlogPath = resolve(`./${type}_backlog.backlog`);
  return await CoreBacklogManager.markDone(backlogPath, taskId);
}

export async function flush(type) {
  const backlogPath = resolve(`./${type}_backlog.backlog`);
  await CoreBacklogManager.flush(backlogPath);
}

export async function updateTask(type, taskId, updates) {
  const backlogPath = resolve(`./${type}_backlog.backlog`);
  await CoreBacklogManager.updateTask(backlogPath, taskId, updates);
}

export async function addTask(type, initialContent) {
  const backlogPath = resolve(`./${type}_backlog.backlog`);
  return await CoreBacklogManager.addTask(backlogPath, initialContent);
}
