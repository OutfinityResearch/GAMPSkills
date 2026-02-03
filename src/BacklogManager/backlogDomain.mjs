export class ChangeQueue {
  constructor() {
    this.queue = [];
  }

  enqueue(taskRef, change) {
    this.queue.push({ taskRef, change });
  }

  drain() {
    // Sort by taskRef for deterministic order
    this.queue.sort((a, b) => a.taskRef.localeCompare(b.taskRef));
    const changes = [...this.queue];
    this.queue = [];
    return changes;
  }

  clear() {
    this.queue = [];
  }
}
