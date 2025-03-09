import { ToolbarConfig, ToolbarElements } from '../core/types';

export function cacheElements(
    config: ToolbarConfig,
    debug: (message: string, data?: any) => void
): ToolbarElements {
    // For pre-rendered toolbars, we don't use the prefix. For dynamically created ones, we do.
    const idPrefix = config.useExistingToolbar ? '' : `${config.toolbarId}-`;

    const elements: ToolbarElements = {
        toolbar: document.getElementById(config.toolbarId),
        container: document.querySelector('.toolbar-container'),
        toolbarInitial: null,
        toolbarLinkInput: null,
        toolbarFontSelect: null,
        linkButton: null,
        linkInput: null,
        saveLink: null,
        cancelLink: null,
        removeLink: null,
        visitLink: null,
        boldButton: null,
        italicButton: null,
        underlineButton: null,
        strikethroughButton: null,
        subscriptButton: null,
        superscriptButton: null,
        h1Button: null,
        h2Button: null,
        dropCapButton: null,
        codeButton: null,
        quoteButton: null,
        hrButton: null,
        bulletListButton: null,
        numberListButton: null,
        fontButton: null,
        fontList: null,
        buttons: {
            bold: { element: null, enabled: undefined },
            italic: { element: null, enabled: undefined },
            underline: { element: null, enabled: undefined },
            strikethrough: { element: null, enabled: undefined },
            subscript: { element: null, enabled: undefined },
            superscript: { element: null, enabled: undefined },
            h1: { element: null, enabled: undefined },
            h2: { element: null, enabled: undefined },
            dropCap: { element: null, enabled: undefined },
            code: { element: null, enabled: undefined },
            quote: { element: null, enabled: undefined },
            hr: { element: null, enabled: undefined },
            bulletList: { element: null, enabled: undefined },
            numberList: { element: null, enabled: undefined },
            font: { element: null, enabled: undefined }
        }
    };

    if (!elements.toolbar) {
        console.error(`FloatingToolbar: Toolbar element with ID "${config.toolbarId}" not found`);
        return elements;
    }

    elements.toolbarInitial = elements.toolbar.querySelector('.toolbar-initial');
    elements.toolbarLinkInput = elements.toolbar.querySelector('.toolbar-link-input');
    
    // Cache all the buttons and inputs
    const elementIds = {
        linkButton: 'link-button',
        linkInput: 'link-input',
        saveLink: 'save-link',
        cancelLink: 'cancel-link',
        removeLink: 'remove-link',
        visitLink: 'visit-link',
        boldButton: 'bold-button',
        italicButton: 'italic-button',
        underlineButton: 'underline-button',
        strikethroughButton: 'strikethrough-button',
        subscriptButton: 'subscript-button',
        superscriptButton: 'superscript-button',
        h1Button: 'h1-button',
        h2Button: 'h2-button',
        dropCapButton: 'drop-cap-button',
        codeButton: 'code-button',
        quoteButton: 'quote-button',
        hrButton: 'hr-button',
        bulletListButton: 'bullet-list-button',
        numberListButton: 'number-list-button',
        fontButton: 'font-button',
        fontList: 'font-list'
    };

    // Cache each element
    Object.entries(elementIds).forEach(([key, id]) => {
        const elementId = `${idPrefix}${id}`;
        const element = document.getElementById(elementId);
        elements[key as keyof ToolbarElements] = element as any;
        if (!element && config.debug) {
            debug(`Element with ID "${elementId}" not found`);
        }
    });

    return elements;
} 