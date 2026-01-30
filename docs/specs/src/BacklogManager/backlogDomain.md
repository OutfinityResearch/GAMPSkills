# backlogDomain

## Description
`backlogDomain` defines rules and models for the project backlogs: the Status enum (`ok`, `needs_work`, `blocked`), validation and allowed transitions, filtering and selection helpers, and a change queue to apply updates in a deterministic order.

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
- `filterByStatus(tasks, status) -> tasks`
  - Input: `tasks` (array/dictionary), `status` (string from STATUS).
  - Output: subset of tasks matching the status.
  - Purpose: select tasks by status for reporting/processing.
- `class ChangeQueue`
  - `enqueue(taskRef, change)`
    - Input: `taskRef` (numeric task id), `change` (object describing planned mutation).
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
- `filterByStatus`
- `ChangeQueue`
