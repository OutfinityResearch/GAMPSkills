/**
 * Greeter module - generates personalized greeting messages.
 */

/**
 * Generates a greeting message for the given name.
 * @param {string} name - The name of the person to greet
 * @returns {string} A greeting in the format "Hello, {name}!"
 * @throws {TypeError} If name is not a string
 * @throws {Error} If name is an empty string
 */
export function greet(name) {
  if (typeof name !== 'string') {
    throw new TypeError('name must be a string');
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length === 0) {
    throw new Error('name cannot be empty');
  }
  
  return `Hello, ${trimmed}!`;
}
