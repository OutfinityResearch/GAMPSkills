# Greeter Module

Provides greeting functionality for the application via a named export.

## Purpose

A simple, pure utility module that generates personalized greeting messages. It has no side effects.

## API

### `export function greet(name)`

Generates a greeting message for the given name.

**Parameters:**
- `name` (string): The name of the person to greet.
  - Must be a string primitive (typeof `string`). Boxed `String` objects are not accepted.
  - The input is trimmed of leading and trailing whitespace using `String.prototype.trim()` before validation.
  - After trimming, the string must not be empty.
  - No specific maximum length is enforced, but safe memory limits apply.
  - Internal whitespace and control characters are preserved as-is.

**Returns:**
- (string): A greeting string in the format `"Hello, {trimmedName}!"`.

**Throws:**
- `TypeError`: If `name` is not a string primitive.
- `Error`: If `name` is an empty string (or contains only whitespace). Message: "Name must not be empty".

## Usage Example

```javascript
import { greet } from './complete.js';

// Standard usage
console.log(greet('Alice'));   // "Hello, Alice!"
console.log(greet('  Bob  ')); // "Hello, Bob!"

// Error handling
try {
  greet(''); 
} catch (err) {
  // Error: Name must not be empty
}
```

## Edge Cases & Constraints

1.  **Trimming:** Input is always trimmed first. `'   '` results in an empty string error.
2.  **Types:** `null`, `undefined`, numbers, and `new String('foo')` throw `TypeError`.
3.  **Unicode:** Supports full Unicode names; no normalization is performed.
4.  **Purity:** The function is synchronous and pure.

## Dependencies

None.
