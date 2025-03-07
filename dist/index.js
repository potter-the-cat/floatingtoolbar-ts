import { FloatingToolbar } from './core/FloatingToolbar.js';
// Add global utility functions
window.ensureValidUrl = (url) => {
    if (!url)
        return '';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
};
window.isValidUrl = (url) => {
    if (!url)
        return false;
    try {
        new URL(window.ensureValidUrl(url));
        return true;
    }
    catch {
        return false;
    }
};
window.findClosestLink = (node) => {
    while (node && node.nodeName !== 'A') {
        node = node.parentNode;
    }
    return node;
};
// Export the FloatingToolbar class
export { FloatingToolbar };
export default FloatingToolbar;
//# sourceMappingURL=index.js.map