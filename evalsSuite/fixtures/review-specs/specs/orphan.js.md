# Orphan Module

A utility module for formatting dates in various formats.

## Purpose

Provides date formatting utilities for the application.

## API

### formatDate(date: Date): string

Formats a JavaScript Date object into an ISO 8601 string.

**Parameters:**
- `date` - A valid JavaScript Date object

**Returns:**
- A string in ISO 8601 format (e.g., "2024-01-15T10:30:00.000Z")

**Throws:**
- TypeError if date is not a valid Date object

## Usage Example

```javascript
import { formatDate } from './orphan.js';

const now = new Date();
console.log(formatDate(now)); // "2024-01-15T10:30:00.000Z"
```

## Dependencies

None.
