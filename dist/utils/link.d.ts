/**
 * Finds the closest anchor element from a given node by traversing up the DOM tree.
 * @param node The starting node to search from
 * @returns The closest anchor element or null if none found
 */
export declare function findClosestLink(node: Node | null): HTMLAnchorElement | null;
/**
 * Validates if a given string is a valid URL.
 * @param url The URL string to validate
 * @returns boolean indicating if the URL is valid
 */
export declare function isValidUrl(url: string): boolean;
/**
 * Ensures a URL string is properly formatted with a protocol.
 * @param url The URL string to format
 * @returns A properly formatted URL string
 */
export declare function ensureValidUrl(url: string): string;
