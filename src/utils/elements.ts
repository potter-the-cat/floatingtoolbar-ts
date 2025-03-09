import { ToolbarConfig, ToolbarElements, ButtonElements } from '../core/types';

export function cacheElements(
    config: ToolbarConfig,
    debug: (message: string, data?: any) => void
): ToolbarElements {
    const container = document.querySelector<HTMLElement>(config.container);
    const toolbar = document.querySelector<HTMLElement>(`#${config.toolbarId}`);
    
    debug('Caching elements', {
        containerId: config.container,
        toolbarId: config.toolbarId,
        hasContainer: !!container,
        hasToolbar: !!toolbar
    });

    const emptyButtonElements: ButtonElements = {
        code: { element: null, enabled: false },
        h1: { element: null, enabled: false },
        h2: { element: null, enabled: false },
        hr: { element: null, enabled: false },
        bulletList: { element: null, enabled: false },
        numberList: { element: null, enabled: false },
        dropCap: { element: null, enabled: false },
        quote: { element: null, enabled: false },
        bold: { element: null, enabled: false },
        italic: { element: null, enabled: false },
        underline: { element: null, enabled: false },
        strikethrough: { element: null, enabled: false },
        subscript: { element: null, enabled: false },
        superscript: { element: null, enabled: false },
        font: { element: null, enabled: false }
    };

    if (!container || !toolbar) {
        debug('Failed to find container or toolbar', {
            container: config.container,
            toolbar: config.toolbarId
        });
        return {
            container: null,
            toolbar: null,
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
            buttons: emptyButtonElements
        };
    }

    const elements: ToolbarElements = {
        container,
        toolbar,
        toolbarInitial: toolbar.querySelector('.toolbar-initial'),
        toolbarLinkInput: toolbar.querySelector('.toolbar-link-input'),
        toolbarFontSelect: toolbar.querySelector('.toolbar-font-select'),
        linkButton: toolbar.querySelector(`#${config.toolbarId}-link-button`),
        linkInput: toolbar.querySelector(`#${config.toolbarId}-link-input`),
        saveLink: toolbar.querySelector(`#${config.toolbarId}-save-link`),
        cancelLink: toolbar.querySelector(`#${config.toolbarId}-cancel-link`),
        removeLink: toolbar.querySelector(`#${config.toolbarId}-remove-link`),
        visitLink: toolbar.querySelector(`#${config.toolbarId}-visit-link`),
        boldButton: toolbar.querySelector(`#${config.toolbarId}-bold-button`),
        italicButton: toolbar.querySelector(`#${config.toolbarId}-italic-button`),
        underlineButton: toolbar.querySelector(`#${config.toolbarId}-underline-button`),
        strikethroughButton: toolbar.querySelector(`#${config.toolbarId}-strikethrough-button`),
        subscriptButton: toolbar.querySelector(`#${config.toolbarId}-subscript-button`),
        superscriptButton: toolbar.querySelector(`#${config.toolbarId}-superscript-button`),
        h1Button: toolbar.querySelector(`#${config.toolbarId}-h1-button`),
        h2Button: toolbar.querySelector(`#${config.toolbarId}-h2-button`),
        dropCapButton: toolbar.querySelector(`#${config.toolbarId}-drop-cap-button`),
        codeButton: toolbar.querySelector(`#${config.toolbarId}-code-button`),
        quoteButton: toolbar.querySelector(`#${config.toolbarId}-quote-button`),
        hrButton: toolbar.querySelector(`#${config.toolbarId}-hr-button`),
        bulletListButton: toolbar.querySelector(`#${config.toolbarId}-bullet-list-button`),
        numberListButton: toolbar.querySelector(`#${config.toolbarId}-number-list-button`),
        fontButton: toolbar.querySelector(`#${config.toolbarId}-font-button`),
        fontList: toolbar.querySelector(`#${config.toolbarId}-font-list`),
        buttons: emptyButtonElements
    };

    debug('Cached elements', {
        hasToolbarInitial: !!elements.toolbarInitial,
        hasToolbarLinkInput: !!elements.toolbarLinkInput,
        hasToolbarFontSelect: !!elements.toolbarFontSelect,
        hasFontButton: !!elements.fontButton,
        fontButtonId: elements.fontButton?.id
    });

    return elements;
} 