import { ToolbarConfig, ToolbarElements } from '../core/types.js';

export function cacheElements(
    config: ToolbarConfig,
    debug: (message: string, data?: any) => void
): ToolbarElements {
    // For pre-rendered toolbars, we don't use the prefix. For dynamically created ones, we do.
    const idPrefix = config.useExistingToolbar ? '' : `${config.toolbarId}-`;

    const elements: ToolbarElements = {
        toolbar: document.getElementById(config.toolbarId),
        toolbarInitial: null,
        toolbarLinkInput: null,
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
        numberListButton: null
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
        numberListButton: 'number-list-button'
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