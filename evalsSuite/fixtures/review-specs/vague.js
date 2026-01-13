/**
 * Vague module - processes data arrays.
 */

/**
 * Processes an array of numbers.
 * @param {number[]} data - Array of numbers to process
 * @returns {{ count: number, sum: number }} Object with count and sum of filtered values
 * @throws {Error} If data is falsy
 */
export function process(data) {
  if (!data) {
    throw new Error('No data provided');
  }
  
  // Double each value and filter those greater than 10
  const result = data.map(x => x * 2).filter(x => x > 10);
  
  // Return count and sum of filtered results
  return {
    count: result.length,
    sum: result.reduce((a, b) => a + b, 0)
  };
}

/**
 * Validates input data before processing.
 * @param {any} data - Data to validate
 * @returns {boolean} True if data is valid array of numbers
 */
export function validate(data) {
  return Array.isArray(data) && data.every(x => typeof x === 'number');
}
