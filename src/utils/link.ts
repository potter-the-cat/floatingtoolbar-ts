/**
 * Finds the closest anchor element from a given node by traversing up the DOM tree.
 * @param node The starting node to search from
 * @returns The closest anchor element or null if none found
 */
export function findClosestLink(node: Node | null): HTMLAnchorElement | null {
    if (!node) return null;

    // If the node is an element and it's an anchor, return it
    if (node instanceof HTMLAnchorElement) {
        return node;
    }

    // If the node is an element, check its parent
    if (node instanceof HTMLElement) {
        const closest = node.closest('a');
        return closest as HTMLAnchorElement;
    }

    // If it's a text node, check its parent
    return findClosestLink(node.parentNode);
}

/**
 * Validates if a given string is a valid URL.
 * @param url The URL string to validate
 * @returns boolean indicating if the URL is valid
 */
export function isValidUrl(url: string): boolean {
    if (!url || url === 'http://' || url === 'https://') return false;
    
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.hostname.length > 0;
    } catch {
        try {
            const parsedUrl = new URL(`http://${url}`);
            return parsedUrl.hostname.length > 0;
        } catch {
            return false;
        }
    }
}

/**
 * Ensures a URL string is properly formatted with a protocol.
 * @param url The URL string to format
 * @returns A properly formatted URL string
 */
export function ensureValidUrl(url: string): string {
    if (!url) return '';
    
    try {
        new URL(url);
        return url;
    } catch {
        try {
            new URL(`http://${url}`);
            return `http://${url}`;
        } catch {
            return '';
        }
    }
} 