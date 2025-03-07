import { FloatingToolbar } from './core/FloatingToolbar.js';
import type { FloatingToolbarConfig, StyleOptions } from './core/config.js';
declare global {
    interface Window {
        ensureValidUrl: (url: string) => string;
        isValidUrl: (url: string) => boolean;
        findClosestLink: (node: Node | null) => HTMLAnchorElement | null;
    }
}
export type { FloatingToolbarConfig, StyleOptions };
export { FloatingToolbar };
export default FloatingToolbar;
