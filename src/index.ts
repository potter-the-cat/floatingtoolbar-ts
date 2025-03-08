import { FloatingToolbar } from './core/FloatingToolbar';
import { findClosestLink, isValidUrl, ensureValidUrl } from './utils/link';
import { ToolbarStyleManager } from './styles/toolbar';

// Extend Window interface to include our utility functions
declare global {
    interface Window {
        findClosestLink: (node: Node | null) => HTMLAnchorElement | null;
        isValidUrl: (url: string) => boolean;
        ensureValidUrl: (url: string) => string;
    }
}

// Add global utility functions using our robust implementations
window.findClosestLink = findClosestLink;
window.isValidUrl = isValidUrl;
window.ensureValidUrl = ensureValidUrl;

// Automatically inject styles when the script loads
ToolbarStyleManager.injectRequiredStyles();
ToolbarStyleManager.injectToolbarStyles();

// Export the FloatingToolbar class
export { FloatingToolbar };
export default FloatingToolbar; 