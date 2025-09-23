/**
 * Formats user-entered URLs to be web-friendly
 * @param input - The user's input string
 * @returns Formatted URL or original input if it's a social username
 */
export function formatUserUrl(input: string): string {
  if (!input || typeof input !== 'string') {
    return input || '';
  }

  const trimmed = input.trim();
  
  // Return empty string if input is empty after trimming
  if (!trimmed) {
    return '';
  }
  
  // Preserve social usernames (anything starting with @)
  if (trimmed.startsWith('@')) {
    return trimmed;
  }
  
  // If it already has https://, return as-is
  if (trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  // Upgrade http:// to https://
  if (trimmed.startsWith('http://')) {
    return trimmed.replace('http://', 'https://');
  }
  
  // Add https:// to domains without protocol
  // Check if it looks like a domain (contains a dot and no spaces)
  if (trimmed.includes('.') && !trimmed.includes(' ')) {
    return `https://${trimmed}`;
  }
  
  // Return original input if it doesn't look like a URL
  return trimmed;
}