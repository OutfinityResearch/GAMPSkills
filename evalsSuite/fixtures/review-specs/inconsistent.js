/**
 * Calculator module - performs arithmetic operations.
 * 
 * NOTE: This implementation MULTIPLIES instead of adding,
 * which is inconsistent with the spec that says it adds!
 */

/**
 * Calculates the product of two numbers.
 * @param {number} a - First number
 * @param {number} b - Second number  
 * @returns {number} The product of a and b
 */
export function calculate(a, b) {
  // BUG: This multiplies instead of adding as documented!
  return a * b;
}
