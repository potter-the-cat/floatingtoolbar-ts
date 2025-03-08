import { FloatingToolbar } from './core/FloatingToolbar.js';
import { findClosestLink, isValidUrl, ensureValidUrl } from './utils/link.js';
// Add global utility functions using our robust implementations
window.findClosestLink = findClosestLink;
window.isValidUrl = isValidUrl;
window.ensureValidUrl = ensureValidUrl;
// Export the FloatingToolbar class
export { FloatingToolbar };
export default FloatingToolbar;
//# sourceMappingURL=index.js.map