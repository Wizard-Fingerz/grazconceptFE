
/**
 * Capitalize the first letter of each word in a string.
 */
export function capitalizeWords(str: string) {
    return str.replace(/\b\w+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
  }
  