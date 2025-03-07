/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
    container: '.content-wrapper',
    content: '.content',
    selector: '.content',
    mode: 'floating',
    theme: 'dark',
    debug: false,
    useExistingToolbar: false,
    buttons: {
        text: {
            bold: true,
            italic: true,
            underline: true,
            strikethrough: true
        },
        script: {
            subscript: true,
            superscript: true
        },
        heading: {
            h1: true,
            h2: true
        },
        special: {
            dropCap: true,
            code: true,
            quote: true,
            hr: true
        },
        list: {
            bullet: true,
            number: true
        },
        link: {
            url: true
        }
    },
    offset: { x: 0, y: 10 },
    fixedPosition: {
        top: 0,
        center: true
    },
    toolbarId: 'floating-toolbar',
    resizeDebounceMs: 150
};
//# sourceMappingURL=config.js.map