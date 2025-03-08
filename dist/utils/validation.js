// Initialize URL validation functions
(function () {
    window.isValidUrl = function (url) {
        if (!url || url === 'http://' || url === 'https://')
            return false;
        try {
            const parsedUrl = new URL(url);
            return parsedUrl.hostname.length > 0;
        }
        catch {
            try {
                const parsedUrl = new URL(`http://${url}`);
                return parsedUrl.hostname.length > 0 &&
                    // Additional validation for common TLDs or domain patterns
                    (parsedUrl.hostname.includes('.') ||
                        parsedUrl.hostname === 'localhost');
            }
            catch {
                return false;
            }
        }
    };
    window.ensureValidUrl = function (url) {
        if (!url)
            return '';
        try {
            new URL(url);
            return url;
        }
        catch {
            try {
                new URL(`http://${url}`);
                return `http://${url}`;
            }
            catch {
                return '';
            }
        }
    };
    window.findClosestLink = function (node) {
        if (!node)
            return null;
        if (node instanceof HTMLAnchorElement) {
            return node;
        }
        if (node instanceof HTMLElement) {
            const closest = node.closest('a');
            return closest;
        }
        return window.findClosestLink(node.parentNode);
    };
})();
export {};
//# sourceMappingURL=validation.js.map