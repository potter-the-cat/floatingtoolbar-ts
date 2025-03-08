export {};
declare global {
    interface Window {
        isValidUrl: (url: string) => boolean;
        ensureValidUrl: (url: string) => string;
        findClosestLink: (node: Node | null) => HTMLAnchorElement | null;
    }
}
