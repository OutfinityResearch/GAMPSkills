# Calculator Module

A simple calculator module that adds two numbers together.

## Purpose

Provides basic arithmetic operations for the application.

## API

### calculate(a: number, b: number): number

Adds two numbers together and returns the sum.

**Parameters:**
- `a` - First number to add
- `b` - Second number to add

**Returns:**
- The sum of a and b

## Usage Example

```javascript
import { calculate } from './inconsistent.js';

const result = calculate(5, 3);
console.log(result); // 8
```

## Edge Cases

- Returns NaN if either argument is not a number
- Handles negative numbers correctly
- Handles floating point numbers
