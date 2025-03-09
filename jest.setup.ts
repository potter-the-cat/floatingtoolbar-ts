import '@testing-library/jest-dom';

// Add Jest specific setup
Object.defineProperty(window, 'getComputedStyle', {
    value: (element: Element) => ({
        getPropertyValue: (prop: string) => {
            return '';
        },
        fontFamily: '',
    }),
});

// Add any missing DOM APIs that might be needed
if (!window.matchMedia) {
    window.matchMedia = () => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
    } as MediaQueryList);
}

// Add custom matchers if needed
expect.extend({
    // Add custom matchers here if needed
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    root: Element | Document | null = null;
    rootMargin: string = '0px';
    thresholds: number[] = [0];
    
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        this.root = options?.root ?? null;
        this.rootMargin = options?.rootMargin ?? '0px';
        this.thresholds = Array.isArray(options?.threshold) ? options.threshold : [options?.threshold ?? 0];
    }
    
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] { return []; }
}; 