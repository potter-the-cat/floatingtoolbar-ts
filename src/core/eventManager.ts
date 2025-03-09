import { ToolbarConfig, ToolbarState, ToolbarElements, ButtonConfigs, FormatType, ButtonElement, ButtonElements } from './types';

interface EventHandlers {
    handleSelection: (e: Event) => void;
    handleFormat: (format: FormatType) => void;
    handleLinkButtonClick: (e: MouseEvent) => void;
    handleSaveLinkClick: (e: MouseEvent) => void;
    handleCancelLinkClick: (e: MouseEvent) => void;
    handleRemoveLinkClick: (e: MouseEvent) => void;
    handleVisitLinkClick: (e: MouseEvent) => void;
    handleLinkInputChange: (e: Event) => void;
    hasSelection: () => boolean;
    updateView: () => void;
    updatePosition: () => void;
    resetToolbar: () => void;
}

export function setupEventListeners(
    config: ToolbarConfig,
    state: ToolbarState,
    elements: ToolbarElements,
    handlers: EventHandlers
): void {
    // Find the specific content area for this instance
    const contentArea = document.querySelector<HTMLElement>(config.selector || '');
    if (!contentArea) return;

    // Track if we're in an active selection
    let isSelecting = false;
    
    // Add focus/blur handlers for the content area
    contentArea.addEventListener('focus', () => {
        // Make this toolbar the active one
        document.querySelectorAll<HTMLElement>('.floating-toolbar').forEach(toolbar => {
            if (toolbar !== elements.toolbar) {
                // Reset other toolbars to their default state
                toolbar.classList.add('persistent-position');
                toolbar.style.position = 'absolute';
                toolbar.style.top = '0';
                toolbar.style.left = '50%';
                toolbar.style.transform = 'translateX(-50%)';
            }
        });
    });

    contentArea.addEventListener('blur', (e: FocusEvent) => {
        // Only reset if we're not clicking within our toolbar
        if (elements.toolbar && e.relatedTarget && !elements.toolbar.contains(e.relatedTarget as Node)) {
            handlers.resetToolbar();
        }
    });

    // Handle mouseup events only for this instance's content area
    const handleMouseUp = (e: MouseEvent) => {
        const target = e.target as Node;
        if (contentArea.contains(target) || (elements.toolbar && elements.toolbar.contains(target))) {
            handlers.handleSelection(e);
        }
    };
    
    // Handle keyup events only for this instance's content area
    const handleKeyUp = (e: KeyboardEvent) => {
        const target = e.target as Node;
        if (contentArea.contains(target) && (e.shiftKey || handlers.hasSelection())) {
            handlers.handleSelection(e);
        }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keyup', handleKeyUp);
    
    // Track selection state for this instance
    document.addEventListener('mousedown', (e: MouseEvent) => {
        const target = e.target as Node;
        if (contentArea.contains(target)) {
            isSelecting = true;
        }
    });
    
    document.addEventListener('mouseup', () => {
        isSelecting = false;
    });

    contentArea.addEventListener('mouseenter', (e: MouseEvent) => {
        if (handlers.hasSelection() || isSelecting) {
            handlers.handleSelection(e);
        }
    });

    contentArea.addEventListener('mouseleave', () => {
        if (isSelecting) {
            state.isVisible = false;
            handlers.updateView();
        }
    });

    // Add scroll handler
    window.addEventListener('scroll', () => {
        if (handlers.hasSelection()) {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                // Only update if the selection is within our content area
                if (contentArea.contains(range.commonAncestorContainer)) {
                    const rect = range.getBoundingClientRect();
                    
                    // Store initial width if not already stored
                    if (elements.toolbar && !elements.toolbar.style.getPropertyValue('--toolbar-width')) {
                        const currentWidth = elements.toolbar.getBoundingClientRect().width;
                        elements.toolbar.style.setProperty('--toolbar-width', `${currentWidth}px`);
                        elements.toolbar.classList.add('following-selection');
                    }
                    
                    if (rect.bottom < 0 || rect.top > window.innerHeight) {
                        state.isVisible = false;
                    } else {
                        state.isVisible = true;
                        state.selectionRect = rect;
                    }
                    handlers.updateView();
                }
            }
        }
    }, { passive: true });

    // Add resize handler with debounce
    window.addEventListener('resize', () => {
        if (state.isVisible) {
            if (state.resizeTimeout) {
                clearTimeout(state.resizeTimeout);
            }
            state.resizeTimeout = window.setTimeout(() => {
                if (state.selectionRange && contentArea.contains(state.selectionRange.commonAncestorContainer)) {
                    state.selectionRect = state.selectionRange.getBoundingClientRect();
                    handlers.updatePosition();
                }
            }, config.resizeDebounceMs);
        }
    });

    // Link-related event listeners (these are always present in the link input section)
    if (elements.linkButton) {
        elements.linkButton.addEventListener('click', handlers.handleLinkButtonClick);
        elements.saveLink?.addEventListener('click', handlers.handleSaveLinkClick);
        elements.cancelLink?.addEventListener('click', handlers.handleCancelLinkClick);
        elements.removeLink?.addEventListener('click', handlers.handleRemoveLinkClick);
        elements.visitLink?.addEventListener('click', handlers.handleVisitLinkClick);
        
        // Add input event listener for URL validation
        elements.linkInput?.addEventListener('input', handlers.handleLinkInputChange);

        // Prevent spaces in the input field
        elements.linkInput?.addEventListener('keypress', (e: KeyboardEvent) => {
            if (e.key === ' ') {
                e.preventDefault();
            }
        });
    }

    // Prevent toolbar interactions from affecting selection
    if (elements.toolbar) {
        elements.toolbar.addEventListener('mousedown', (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
        });
    }

    // Add formatting button event listeners based on configuration
    const buttonConfig: ButtonElements = {
        // Text formatting
        bold: { element: elements.boldButton, enabled: config.buttons.text?.bold },
        italic: { element: elements.italicButton, enabled: config.buttons.text?.italic },
        underline: { element: elements.underlineButton, enabled: config.buttons.text?.underline },
        strikethrough: { element: elements.strikethroughButton, enabled: config.buttons.text?.strikethrough },
        
        // Script formatting
        subscript: { element: elements.subscriptButton, enabled: config.buttons.script?.subscript },
        superscript: { element: elements.superscriptButton, enabled: config.buttons.script?.superscript },
        
        // Headings
        h1: { element: elements.h1Button, enabled: config.buttons.heading?.h1 },
        h2: { element: elements.h2Button, enabled: config.buttons.heading?.h2 },
        
        // Special formatting
        dropCap: { element: elements.dropCapButton, enabled: config.buttons.special?.dropCap },
        code: { element: elements.codeButton, enabled: config.buttons.special?.code },
        quote: { element: elements.quoteButton, enabled: config.buttons.special?.quote },
        hr: { element: elements.hrButton, enabled: config.buttons.special?.hr },
        
        // Lists
        bulletList: { element: elements.bulletListButton, enabled: config.buttons.list?.bullet },
        numberList: { element: elements.numberListButton, enabled: config.buttons.list?.number }
    };

    // Add event listeners only for enabled buttons that exist in the DOM
    (Object.entries(buttonConfig) as Array<[FormatType, ButtonElement]>).forEach(([format, config]) => {
        if (config.enabled && config.element) {
            config.element.addEventListener('click', () => handlers.handleFormat(format));
        }
    });

    // Selection handling
    document.addEventListener('mouseup', handlers.handleSelection);
    document.addEventListener('keyup', handlers.handleSelection);
    document.addEventListener('selectionchange', handlers.handleSelection);
}

export function destroyEventListeners(
    state: ToolbarState,
    elements: ToolbarElements,
    handlers: {
        handleSelection: (e: Event) => void;
        handleFormat: (format: string) => void;
        handleLinkButtonClick: (e: MouseEvent) => void;
        handleSaveLinkClick: (e: MouseEvent) => void;
        handleCancelLinkClick: (e: MouseEvent) => void;
        handleRemoveLinkClick: (e: MouseEvent) => void;
        handleVisitLinkClick: (e: MouseEvent) => void;
        hasSelection: () => boolean;
    }
): void {
    // Remove event listeners
    document.removeEventListener('mouseup', handlers.handleSelection);
    document.removeEventListener('keyup', (e: KeyboardEvent) => {
        if (e.shiftKey || handlers.hasSelection()) {
            handlers.handleSelection(e);
        }
    });

    // Clear any existing resize timeout
    if (state.resizeTimeout) {
        clearTimeout(state.resizeTimeout);
    }

    // Only remove event listeners for elements that exist
    if (elements.linkButton) {
        elements.linkButton.removeEventListener('click', handlers.handleLinkButtonClick);
        if (elements.saveLink) {
            elements.saveLink.removeEventListener('click', handlers.handleSaveLinkClick);
        }
        if (elements.cancelLink) {
            elements.cancelLink.removeEventListener('click', handlers.handleCancelLinkClick);
        }
        if (elements.removeLink) {
            elements.removeLink.removeEventListener('click', handlers.handleRemoveLinkClick);
        }
        if (elements.visitLink) {
            elements.visitLink.removeEventListener('click', handlers.handleVisitLinkClick);
        }
    }
    
    // Remove formatting button event listeners only if they exist
    const buttonRemovals = [
        { element: elements.boldButton, format: 'bold' },
        { element: elements.italicButton, format: 'italic' },
        { element: elements.underlineButton, format: 'underline' },
        { element: elements.strikethroughButton, format: 'strikethrough' },
        { element: elements.subscriptButton, format: 'subscript' },
        { element: elements.superscriptButton, format: 'superscript' },
        { element: elements.h1Button, format: 'h1' },
        { element: elements.h2Button, format: 'h2' },
        { element: elements.dropCapButton, format: 'dropCap' },
        { element: elements.codeButton, format: 'code' },
        { element: elements.quoteButton, format: 'quote' },
        { element: elements.hrButton, format: 'hr' },
        { element: elements.bulletListButton, format: 'bulletList' },
        { element: elements.numberListButton, format: 'numberList' }
    ];

    buttonRemovals.forEach(({ element, format }) => {
        if (element) {
            element.removeEventListener('click', () => handlers.handleFormat(format));
        }
    });
    
    // Clean up DOM if toolbar exists
    if (elements.toolbar) {
        elements.toolbar.remove();
    }
} 