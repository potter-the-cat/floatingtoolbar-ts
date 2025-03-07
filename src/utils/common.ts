/**
 * Ensure URL has a protocol
 */
export function ensureValidUrl(url: string): string {
    return !/^https?:\/\//i.test(url) ? `https://${url}` : url;
}

/**
 * Validate a URL string
 */
export function isValidUrl(url: string): boolean {
    if (!url) return false;
    
    try {
        // Remove any spaces from the URL
        url = url.replace(/\s/g, '');
        
        // Add protocol if missing for URL parsing
        const urlWithProtocol = ensureValidUrl(url);
        const urlObj = new URL(urlWithProtocol);
        
        // Check if we have a valid hostname (domain)
        if (!urlObj.hostname) {
            return false;
        }

        // Check if it's an IP address
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        
        if (ipv4Regex.test(urlObj.hostname)) {
            // Validate IPv4 address parts
            const parts = urlObj.hostname.split('.');
            return parts.every(part => {
                const num = parseInt(part, 10);
                return num >= 0 && num <= 255;
            });
        }
        
        if (ipv6Regex.test(urlObj.hostname)) {
            // IPv6 format is valid
            return true;
        }

        // If not an IP address, validate domain format
        const hostnameParts = urlObj.hostname.split('.');
        
        // Ensure we have at least two parts (domain and TLD)
        if (hostnameParts.length < 2) {
            return false;
        }
        
        // Check that each part has at least one character
        // and that the TLD has at least 2 characters
        const tld = hostnameParts[hostnameParts.length - 1];
        if (tld.length < 2) {
            return false;
        }
        
        if (hostnameParts.some(part => part.length === 0)) {
            return false;
        }

        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Find the closest anchor element from a node
 */
export function findClosestLink(node: Node | null): HTMLAnchorElement | null {
    if (!node) return null;
    
    let current: Node | null = node;
    while (current && (current as Element).nodeName !== 'A') {
        current = current.parentNode;
    }
    return current as HTMLAnchorElement | null;
}