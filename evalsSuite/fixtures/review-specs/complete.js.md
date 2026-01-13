# Greeter Module

Provides greeting functionality for the application.

## Purpose

A simple utility module that generates personalized greeting messages.

## API

### greet(name: string): string

Generates a greeting message for the given name.

**Parameters:**
- `name` - The name of the person to greet. Must be a non-empty string.

**Returns:**
- A greeting string in the format "Hello, {name}!"

**Throws:**
- `TypeError` if name is not a string
- `Error` if name is an empty string

## Usage Example

```javascript
import { greet } from './complete.js';

console.log(greet('Alice')); // "Hello, Alice!"
console.log(greet('Bob'));   // "Hello, Bob!"
```

## Edge Cases

- Throws TypeError for non-string inputs (null, undefined, numbers, objects)
- Throws Error for empty strings
- Handles names with special characters and unicode
- Trims whitespace from names

## Dependencies

None.
