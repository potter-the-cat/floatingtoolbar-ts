// Add Jest specific setup
Object.defineProperty(window, 'getComputedStyle', {
    value: () => ({
        getPropertyValue: () => '',
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