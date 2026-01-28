/**
 * Utility function to get the correct asset path with base URL
 */
export const getAssetPath = (path: string): string => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  return `${baseUrl}${path.startsWith('/') ? path.slice(1) : path}`;
};

/**
 * Get the icon path with proper base URL
 */
export const getIconPath = (iconFile: string): string => {
  return getAssetPath(`icons/${iconFile}`);
};