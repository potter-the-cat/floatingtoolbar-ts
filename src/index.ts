import { FloatingToolbar as FloatingToolbarClass } from './core/FloatingToolbar';
import { findClosestLink, isValidUrl, ensureValidUrl } from './utils/link';
import { ToolbarStyleManager } from './styles/toolbar';
import { FloatingToolbarConfig } from './core/types';

// Create the FloatingToolbar namespace
const FloatingToolbar = {
    init: (config: Partial<FloatingToolbarConfig> = {}) => new FloatingToolbarClass(config),
    // Add other static methods here if needed
};

// Extend Window interface to include our utility functions and FloatingToolbar
declare global {
    interface Window {
        findClosestLink: (node: Node | null) => HTMLAnchorElement | null;
        isValidUrl: (url: string) => boolean;
        ensureValidUrl: (url: string) => string;
        FloatingToolbar: typeof FloatingToolbar;
    }
}

// Add global utility functions using our robust implementations
window.findClosestLink = findClosestLink;
window.isValidUrl = isValidUrl;
window.ensureValidUrl = ensureValidUrl;

// Assign the FloatingToolbar namespace to window
window.FloatingToolbar = FloatingToolbar;

// Automatically inject styles when the script loads
ToolbarStyleManager.injectRequiredStyles();

// Export for module usage
export default FloatingToolbar; 