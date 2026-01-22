# backlogDomain

## Description
`backlogDomain` defines rules and models for the project backlogs: the Status enum (`ok`, `needs_work`, `blocked`), validation and allowed transitions, standard shapes for issues/options/resolution, filtering and selection helpers, and a change queue to apply updates in a deterministic order.

## Dependencies
- None external; relies only on internal/standard language utilities.

## Main methods / structures
- `STATUS = { ok, needs_work, blocked }`
  - Purpose: stable enum for the Status field; `needs_work` covers both WIP and known problems.
- `assertValidStatus(status)`
  - Input: `status` (string).
  - Output: throws on invalid; returns void on success.
  - Purpose: enforce allowed status values.
- `nextAllowed(current, next?)`
  - Input: `current` (string status), `next` (string status, optional).
  - Output: boolean or throws if transition is invalid; can also return the normalized next status.
  - Purpose: gate state transitions (e.g., `needs_work` → `ok`/`blocked`; `blocked` stays until unlocked explicitly).
- `normalizeIssue(raw) -> issue`
  - Input: `raw` (string/object with fields like `title`, optional `details`, optional `status`).
  - Output: `issue` object `{ id, title, details?, status? }` normalized for storage/rendering.
  - Purpose: create consistent issue/option entries.
- `toMarkdown(issue) -> string`
  - Input: `issue` (normalized object).
  - Output: `string` list entry in backlog numbered format.
  - Purpose: deterministic serialization of an issue/option line.
- `fromMarkdown(block) -> issue`
  - Input: `block` (string list line from backlog).
  - Output: `issue` (normalized object).
  - Purpose: deterministic parse from text to structured issue.
- `filterByStatus(tasks, status) -> tasks`
  - Input: `tasks` (array/dictionary), `status` (string from STATUS).
  - Output: subset of tasks matching the status.
  - Purpose: select tasks by status for reporting/processing.
- `findByFile(tasks, fileKey) -> task`
  - Input: `tasks` (array/dictionary), `fileKey` (string identifier).
  - Output: `task` object or null.
  - Purpose: look up the task for a specific file.
- `listIssues(tasks) -> Issue[]`
  - Input: `tasks` (array/dictionary of tasks).
  - Output: array of normalized issues across all tasks.
  - Purpose: aggregate all issues for reporting/processing.
- `class ChangeQueue`
  - `enqueue(taskRef, change)`
    - Input: `sectionRef` (fileKey/section), `change` (object describing planned mutation).
    - Output: void; queues the change.
  - `drain() -> orderedChanges`
    - Input: none.
    - Output: array of queued changes in deterministic order and clears the queue.
  - `clear()`
    - Input: none.
    - Output: void; empties the queue.
  - Purpose: stage and apply changes in a controlled order without side effects mid-flight.

## Exports
- `STATUS`
- `assertValidStatus`
- `nextAllowed`
- `normalizeIssue`
- `toMarkdown`
- `fromMarkdown`
- `filterByStatus`
- `findByFile`
- `listIssues`
- `ChangeQueue`
