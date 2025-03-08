import { FloatingToolbar } from './core/FloatingToolbar';
declare global {
    interface Window {
        findClosestLink: (node: Node | null) => HTMLAnchorElement | null;
        isValidUrl: (url: string) => boolean;
        ensureValidUrl: (url: string) => string;
    }
}
export { FloatingToolbar };
export default FloatingToolbar;
