export function setupEventListeners(config, state, elements, handlers) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
    // Find the specific content area for this instance
    const contentArea = document.querySelector(config.selector || '');
    if (!contentArea)
        return;
    // Track if we're in an active selection
    let isSelecting = false;
    // Add focus/blur handlers for the content area
    contentArea.addEventListener('focus', () => {
        // Make this toolbar the active one
        document.querySelectorAll('.floating-toolbar').forEach(toolbar => {
            if (toolbar !== elements.toolbar) {
                // Reset other toolbars to their default state
                toolbar.classList.add('fixed-position');
                toolbar.style.position = 'absolute';
                toolbar.style.top = '0';
                toolbar.style.left = '50%';
                toolbar.style.transform = 'translateX(-50%)';
            }
        });
    });
    contentArea.addEventListener('blur', (e) => {
        // Only reset if we're not clicking within our toolbar
        if (elements.toolbar && e.relatedTarget && !elements.toolbar.contains(e.relatedTarget)) {
            handlers.resetToolbar();
        }
    });
    // Handle mouseup events only for this instance's content area
    const handleMouseUp = (e) => {
        const target = e.target;
        if (contentArea.contains(target) || (elements.toolbar && elements.toolbar.contains(target))) {
            handlers.handleSelection(e);
        }
    };
    // Handle keyup events only for this instance's content area
    const handleKeyUp = (e) => {
        const target = e.target;
        if (contentArea.contains(target) && (e.shiftKey || handlers.hasSelection())) {
            handlers.handleSelection(e);
        }
    };
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keyup', handleKeyUp);
    // Track selection state for this instance
    document.addEventListener('mousedown', (e) => {
        const target = e.target;
        if (contentArea.contains(target)) {
            isSelecting = true;
        }
    });
    document.addEventListener('mouseup', () => {
        isSelecting = false;
    });
    contentArea.addEventListener('mouseenter', (e) => {
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
                    }
                    else {
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
        (_a = elements.saveLink) === null || _a === void 0 ? void 0 : _a.addEventListener('click', handlers.handleSaveLinkClick);
        (_b = elements.cancelLink) === null || _b === void 0 ? void 0 : _b.addEventListener('click', handlers.handleCancelLinkClick);
        (_c = elements.removeLink) === null || _c === void 0 ? void 0 : _c.addEventListener('click', handlers.handleRemoveLinkClick);
        (_d = elements.visitLink) === null || _d === void 0 ? void 0 : _d.addEventListener('click', handlers.handleVisitLinkClick);
        // Add input event listener for URL validation
        (_e = elements.linkInput) === null || _e === void 0 ? void 0 : _e.addEventListener('input', handlers.handleLinkInputChange);
        // Prevent spaces in the input field
        (_f = elements.linkInput) === null || _f === void 0 ? void 0 : _f.addEventListener('keypress', (e) => {
            if (e.key === ' ') {
                e.preventDefault();
            }
        });
    }
    // Prevent toolbar interactions from affecting selection
    if (elements.toolbar) {
        elements.toolbar.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    }
    // Add formatting button event listeners based on configuration
    const buttonConfig = {
        // Text formatting
        bold: { element: elements.boldButton, enabled: (_g = config.buttons.text) === null || _g === void 0 ? void 0 : _g.bold },
        italic: { element: elements.italicButton, enabled: (_h = config.buttons.text) === null || _h === void 0 ? void 0 : _h.italic },
        underline: { element: elements.underlineButton, enabled: (_j = config.buttons.text) === null || _j === void 0 ? void 0 : _j.underline },
        strikethrough: { element: elements.strikethroughButton, enabled: (_k = config.buttons.text) === null || _k === void 0 ? void 0 : _k.strikethrough },
        // Script formatting
        subscript: { element: elements.subscriptButton, enabled: (_l = config.buttons.script) === null || _l === void 0 ? void 0 : _l.subscript },
        superscript: { element: elements.superscriptButton, enabled: (_m = config.buttons.script) === null || _m === void 0 ? void 0 : _m.superscript },
        // Headings
        h1: { element: elements.h1Button, enabled: (_o = config.buttons.heading) === null || _o === void 0 ? void 0 : _o.h1 },
        h2: { element: elements.h2Button, enabled: (_p = config.buttons.heading) === null || _p === void 0 ? void 0 : _p.h2 },
        // Special formatting
        dropCap: { element: elements.dropCapButton, enabled: (_q = config.buttons.special) === null || _q === void 0 ? void 0 : _q.dropCap },
        code: { element: elements.codeButton, enabled: (_r = config.buttons.special) === null || _r === void 0 ? void 0 : _r.code },
        quote: { element: elements.quoteButton, enabled: (_s = config.buttons.special) === null || _s === void 0 ? void 0 : _s.quote },
        hr: { element: elements.hrButton, enabled: (_t = config.buttons.special) === null || _t === void 0 ? void 0 : _t.hr },
        // Lists
        bulletList: { element: elements.bulletListButton, enabled: (_u = config.buttons.list) === null || _u === void 0 ? void 0 : _u.bullet },
        numberList: { element: elements.numberListButton, enabled: (_v = config.buttons.list) === null || _v === void 0 ? void 0 : _v.number }
    };
    // Add event listeners only for enabled buttons that exist in the DOM
    Object.entries(buttonConfig).forEach(([format, config]) => {
        if (config.enabled && config.element) {
            config.element.addEventListener('click', () => handlers.handleFormat(format));
        }
    });
}
export function destroyEventListeners(state, elements, handlers) {
    // Remove event listeners
    document.removeEventListener('mouseup', handlers.handleSelection);
    document.removeEventListener('keyup', (e) => {
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
