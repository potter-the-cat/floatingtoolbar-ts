import { ToolbarConfig, ToolbarState, ToolbarElements } from '../core/types';

interface ViewportMeasurements {
    window: {
        innerHeight: number;
        innerWidth: number;
        scrollY: number;
        pageYOffset: number;
    };
    viewport: {
        top: number;
        bottom: number;
        visualTop: number;
        visualHeight: number;
    };
    contentArea: {
        rect: DOMRect;
        offsetTop: number;
        offsetHeight: number;
        scrollTop: number;
    };
    container: {
        rect: DOMRect;
        offsetTop: number;
        offsetHeight: number;
        scrollTop: number;
    };
    toolbar: {
        rect: DOMRect;
        offsetTop: number;
        offsetHeight: number;
    };
}

interface SpaceCalculations {
    selectionTopFromViewport: number;
    selectionBottomFromViewport: number;
    toolbarTotalHeight: number;
    viewportHeight: number;
    visualViewportHeight: number;
    spaceAboveSelection: number;
    spaceBelowSelection: number;
    containerTopOffset: number;
    containerBottomOffset: number;
}

export function setupToolbarPositionObserver(
    config: ToolbarConfig,
    state: ToolbarState,
    elements: ToolbarElements,
    debug: (message: string, data?: any) => void
): IntersectionObserver | null {
    if (!elements.toolbar || !elements.container) return null;

    debug('Setting up position observer', {
        isPersistent: state.isPersistent,
        isAtPersistentPosition: state.isAtPersistentPosition,
        currentView: state.currentView
    });

    const observer = new IntersectionObserver(
        (entries) => {
            const entry = entries[0];
            if (!elements.toolbar) return;

            // If we're in link editing mode and not in persistent position, preserve current position
            if (state.currentView === 'linkInput' && !state.isAtPersistentPosition) {
                debug('Preserving position during link editing', {
                    currentView: state.currentView
                });
                return;
            }

            // Update selection rect if needed
            if (state.selectionRect && !state.isAtPersistentPosition) {
                updateSelectionRect(state, debug);
            }

            // Handle persistent position transitions
            if (!entry.isIntersecting && state.isPersistent) {
                // Container is out of view, switch to persistent position mode
                elements.toolbar.classList.add('persistent-position');
                elements.toolbar.style.position = 'absolute';
                elements.toolbar.style.top = '0';
                elements.toolbar.style.left = '50%';
                elements.toolbar.style.transform = 'translateX(-50%)';
                state.isAtPersistentPosition = true;

                // Clear preserved position when switching to persistent
                delete elements.toolbar.dataset.preservedTop;
                delete elements.toolbar.dataset.preservedLeft;

                debug('Switched to persistent position', {
                    boundingRect: elements.toolbar.getBoundingClientRect()
                });
            } else if (entry.isIntersecting && !state.isPersistent) {
                // Only switch to normal positioning if we're not in persistent mode
                elements.toolbar.classList.remove('persistent-position');
                elements.toolbar.style.position = 'absolute';
                state.isAtPersistentPosition = false;
                
                // If we have a selection, update position relative to it
                if (state.selectionRect) {
                    elements.toolbar.classList.add('following-selection');
                    updateToolbarPosition(config, state, elements, debug);
                }

                debug('Switched to normal position', {
                    boundingRect: elements.toolbar.getBoundingClientRect()
                });
            }
        },
        { threshold: [0, 1] }
    );

    observer.observe(elements.container);
    return observer;
}

export function updateToolbarVisibility(
    config: ToolbarConfig,
    state: ToolbarState,
    elements: ToolbarElements,
    debug: (message: string, data?: any) => void
): void {
    if (!elements.toolbar) return;

    const selection = document.getSelection();
    const hasSelection = selection ? selection.toString().trim().length > 0 : false;

    if (!state.isPersistent) {
        elements.toolbar.style.display = hasSelection ? 'flex' : 'none';
        return;
    }

    handlePersistentMode(config, state, elements, debug);
}

function handlePersistentMode(
    config: ToolbarConfig,
    state: ToolbarState,
    elements: ToolbarElements,
    debug: (message: string, data?: any) => void
): void {
    if (!elements.toolbar) return;

    const selection = document.getSelection();
    const hasSelection = selection ? selection.toString().trim().length > 0 : false;

    // Handle link editing states
    if (state.currentView === 'linkInput') {
        if (state.selectionRect) {
            // For both new and existing links, position at selection
            elements.toolbar.classList.remove('persistent-position');
            elements.toolbar.classList.add('following-selection');
            updateToolbarPosition(config, state, elements, debug);
            return;
        }
    }

    if (!hasSelection) {
        debug('Persistent Mode: No selection - resetting to default position', {
            isPersistent: state.isPersistent,
            isAtPersistentPosition: state.isAtPersistentPosition
        });

        resetToPersistentPosition(state, elements);
    } else if (state.selectionRect) {
        updateToolbarPosition(config, state, elements, debug);
    }
}

function resetToPersistentPosition(
    state: ToolbarState,
    elements: ToolbarElements
): void {
    if (!elements.toolbar) return;

    elements.toolbar.classList.add('persistent-position');
    elements.toolbar.classList.remove('following-selection');
    elements.toolbar.classList.remove('below');
    state.isAtPersistentPosition = true;

    elements.toolbar.style.position = 'absolute';
    elements.toolbar.style.top = '0';
    elements.toolbar.style.left = '50%';
    elements.toolbar.style.transform = 'translateX(-50%)';

    // Clear the stored width
    elements.toolbar.style.removeProperty('--toolbar-width');
}

export function updatePosition(
    config: ToolbarConfig,
    state: ToolbarState,
    elements: ToolbarElements,
    debug: (message: string, data?: any) => void
): void {
    if (!elements.toolbar) return;

    if (!state.isPersistent) {
        handleFloatingMode(config, state, elements, debug);
    } else {
        handlePersistentMode(config, state, elements, debug);
    }
}

function handleFloatingMode(
    config: ToolbarConfig,
    state: ToolbarState,
    elements: ToolbarElements,
    debug: (message: string, data?: any) => void
): void {
    if (!state.selectionRect || !elements.toolbar) return;

    updateToolbarPosition(config, state, elements, debug);
}

function updateToolbarPosition(
    config: ToolbarConfig,
    state: ToolbarState,
    elements: ToolbarElements,
    debug: (message: string, data?: any) => void
): void {
    if (!elements.toolbar || !state.selectionRect) return;

    const rect = state.selectionRect;
    const contentWrapper = elements.toolbar.closest('.content-wrapper');
    if (!contentWrapper) return;

    const wrapperRect = contentWrapper.getBoundingClientRect();
    const toolbarRect = elements.toolbar.getBoundingClientRect();

    // Store current width before any changes
    const currentWidth = toolbarRect.width;
    elements.toolbar.style.setProperty('--toolbar-width', `${currentWidth}px`);

    // Calculate positions
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldPositionBelow = spaceAbove < (toolbarRect.height + config.offset.y);

    // Calculate horizontal position
    let left = rect.left + (rect.width / 2) - wrapperRect.left;
    const minLeft = toolbarRect.width / 2;
    const maxLeft = wrapperRect.width - (toolbarRect.width / 2);
    left = Math.max(minLeft, Math.min(left, maxLeft));

    debug('Updating toolbar position', {
        selectionRect: rect,
        wrapperRect,
        toolbarRect,
        spaceAbove,
        spaceBelow,
        shouldPositionBelow,
        calculatedLeft: left
    });

    // Position the toolbar
    elements.toolbar.classList.remove('persistent-position');
    elements.toolbar.classList.add('following-selection');
    elements.toolbar.classList.toggle('below', shouldPositionBelow);
    state.isAtPersistentPosition = false;

    elements.toolbar.style.position = 'absolute';
    elements.toolbar.style.left = `${left}px`;
    elements.toolbar.style.transform = 'translateX(-50%)';

    if (shouldPositionBelow) {
        elements.toolbar.style.top = `${rect.bottom - wrapperRect.top + config.offset.y}px`;
    } else {
        elements.toolbar.style.top = `${rect.top - wrapperRect.top - toolbarRect.height - config.offset.y}px`;
    }
}

export function resetToolbar(
    state: ToolbarState,
    elements: ToolbarElements,
    clearFormatButtonStates: () => void
): void {
    // Only reset if we're in persistent mode
    if (state.isPersistent && elements.toolbar) {
        state.isVisible = true;
        state.currentView = 'initial';
        state.isAtPersistentPosition = true;
        
        elements.toolbar.classList.add('persistent-position');
        elements.toolbar.classList.remove('following-selection');
        elements.toolbar.classList.remove('below');
        
        elements.toolbar.style.position = 'absolute';
        elements.toolbar.style.top = '0';
        elements.toolbar.style.left = '50%';
        elements.toolbar.style.transform = 'translateX(-50%)';
        
        // Clear any active states
        clearFormatButtonStates();
    }
}

export function updateView(
    this: {
        config: ToolbarConfig;
        state: ToolbarState;
        elements: ToolbarElements;
        updatePosition: () => void;
        updateVisitButton: (url: string) => void;
    }
): void {
    if (!this.elements.toolbar) return;

    // In persistent mode, toolbar is always displayed and has persistent-position class
    if (this.state.isPersistent) {
        this.elements.toolbar.classList.add('visible');
        this.elements.toolbar.classList.add('persistent-position');
    } else {
        this.elements.toolbar.classList.toggle('visible', this.state.isVisible);
        this.elements.toolbar.classList.remove('persistent-position');
    }

    // Handle current view
    if (this.state.currentView === 'initial') {
        if (this.elements.toolbarInitial) {
            this.elements.toolbarInitial.style.display = 'flex';
        }
        if (this.elements.toolbarLinkInput) {
            this.elements.toolbarLinkInput.classList.remove('active');
            this.elements.toolbarLinkInput.style.display = 'none';
            if (this.elements.linkInput) {
                this.elements.linkInput.disabled = false;
                this.elements.linkInput.style.pointerEvents = 'auto';
            }
        }
    } else if (this.state.currentView === 'linkInput' && this.elements.toolbarLinkInput) {
        if (this.elements.toolbarInitial) {
            this.elements.toolbarInitial.style.display = 'none';
        }
        if (this.elements.toolbarLinkInput) {
            this.elements.toolbarLinkInput.classList.add('active');
            this.elements.toolbarLinkInput.style.display = 'flex';
            if (this.elements.linkInput) {
                this.elements.linkInput.disabled = false;
                this.elements.linkInput.style.pointerEvents = 'auto';
                
                // Focus the input after a short delay to ensure it's visible
                setTimeout(() => {
                    if (this.elements.linkInput) {
                        this.elements.linkInput.focus();
                    }
                }, 50);
            }
            
            // Show/hide remove button based on whether we're editing an existing link
            if (this.elements.removeLink) {
                this.elements.removeLink.style.display = this.state.existingLink ? 'flex' : 'none';
            }
            // Update visit button based on current URL
            if (this.elements.linkInput && this.elements.visitLink) {
                this.updateVisitButton(this.elements.linkInput.value.trim());
            }
        }
    }

    // Update position if visible
    if (this.state.isVisible || this.state.isPersistent) {
        this.updatePosition();
    }
}

function updateSelectionRect(
    state: ToolbarState,
    debug: (message: string, data?: any) => void
): void {
    const selection = document.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    state.selectionRect = rect;

    debug('Updated selection rect', { rect });
} 