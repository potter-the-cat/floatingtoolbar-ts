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
): void {
    if (!elements.toolbar || !elements.toolbarContainer) return;

    // Cleanup any existing observer
    if (state.positionObserver) {
        state.positionObserver.disconnect();
    }

    // Create observer for the toolbar container
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (!elements.toolbar) return;

                debug('Intersection Observer Update', {
                    isIntersecting: entry.isIntersecting,
                    currentView: state.currentView,
                    isFixed: state.isFixed,
                    isAtFixedPosition: state.isAtFixedPosition,
                    hasSelection: state.selectionRect !== null,
                    toolbarClasses: Array.from(elements.toolbar.classList),
                    toolbarPosition: elements.toolbar.getBoundingClientRect(),
                    toolbarStyle: {
                        position: elements.toolbar.style.position,
                        top: elements.toolbar.style.top,
                        left: elements.toolbar.style.left,
                        transform: elements.toolbar.style.transform
                    },
                    preservedPosition: {
                        top: elements.toolbar.dataset.preservedTop,
                        left: elements.toolbar.dataset.preservedLeft
                    }
                });

                // If we're in link editing mode and not fixed position, preserve current position
                if (state.currentView === 'linkInput' && !state.isAtFixedPosition) {
                    // Check for preserved position
                    const preservedTop = elements.toolbar.dataset.preservedTop;
                    const preservedLeft = elements.toolbar.dataset.preservedLeft;
                    if (preservedTop && preservedLeft) {
                        elements.toolbar.style.top = preservedTop;
                        elements.toolbar.style.left = preservedLeft;
                        debug('Restored preserved position during link input', {
                            top: preservedTop,
                            left: preservedLeft
                        });
                    }
                    return;
                }

                // If we have an active selection, maintain position relative to selection
                if (state.selectionRect && !state.isAtFixedPosition) {
                    return;
                }

                // Handle fixed position transitions
                if (!entry.isIntersecting && state.isFixed) {
                    // Container is out of view, switch to fixed position mode
                    elements.toolbar.classList.add('fixed-position');
                    elements.toolbar.classList.remove('following-selection');
                    elements.toolbar.style.position = 'absolute';
                    elements.toolbar.style.top = '0';
                    elements.toolbar.style.left = '50%';
                    elements.toolbar.style.transform = 'translateX(-50%)';
                    state.isAtFixedPosition = true;

                    // Clear preserved position when switching to fixed
                    delete elements.toolbar.dataset.preservedTop;
                    delete elements.toolbar.dataset.preservedLeft;

                    debug('Switched to fixed position', {
                        boundingRect: elements.toolbar.getBoundingClientRect()
                    });
                } else if (entry.isIntersecting && !state.isFixed) {
                    // Only switch to normal positioning if we're not in fixed mode
                    elements.toolbar.classList.remove('fixed-position');
                    elements.toolbar.style.position = 'absolute';
                    state.isAtFixedPosition = false;
                    
                    // If we have a selection, update position relative to it
                    if (state.selectionRect) {
                        elements.toolbar.classList.add('following-selection');
                        updateToolbarPosition(config, state, elements, debug);
                    }

                    debug('Switched to normal position', {
                        boundingRect: elements.toolbar.getBoundingClientRect()
                    });
                }
            });
        },
        {
            // Start observing slightly before the element goes out of view
            rootMargin: '-1px 0px 0px 0px',
            threshold: [0, 1]
        }
    );

    // Start observing the toolbar container
    observer.observe(elements.toolbarContainer);
    state.positionObserver = observer;

    debug('Position observer setup complete', {
        container: elements.toolbarContainer,
        toolbar: elements.toolbar
    });
}

export function updatePosition(
    config: ToolbarConfig,
    state: ToolbarState,
    elements: ToolbarElements,
    debug: (message: string, data?: any) => void
): void {
    if (!elements.toolbar) return;

    if (!state.isFixed) {
        handleFloatingMode(config, state, elements, debug);
    } else {
        handleFixedMode(config, state, elements, debug);
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

function handleFixedMode(
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
            elements.toolbar.classList.remove('fixed-position');
            elements.toolbar.classList.add('following-selection');
            updateToolbarPosition(config, state, elements, debug);
            return;
        }
    }

    if (!hasSelection) {
        debug('Fixed Mode: No selection - resetting to default position', {
            isFixed: state.isFixed,
            isAtFixedPosition: state.isAtFixedPosition
        });

        resetToFixedPosition(state, elements);
    } else if (state.selectionRect) {
        updateToolbarPosition(config, state, elements, debug);
    }
}

function resetToFixedPosition(
    state: ToolbarState,
    elements: ToolbarElements
): void {
    if (!elements.toolbar) return;

    elements.toolbar.classList.add('fixed-position');
    elements.toolbar.classList.remove('following-selection');
    elements.toolbar.classList.remove('below');
    state.isAtFixedPosition = true;

    elements.toolbar.style.position = 'absolute';
    elements.toolbar.style.top = '0';
    elements.toolbar.style.left = '50%';
    elements.toolbar.style.transform = 'translateX(-50%)';

    // Clear the stored width
    elements.toolbar.style.removeProperty('--toolbar-width');
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
    elements.toolbar.classList.remove('fixed-position');
    elements.toolbar.classList.add('following-selection');
    elements.toolbar.classList.toggle('below', shouldPositionBelow);
    state.isAtFixedPosition = false;

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
    // Only reset if we're in fixed mode
    if (state.isFixed && elements.toolbar) {
        state.isVisible = true;
        state.currentView = 'initial';
        state.isAtFixedPosition = true;
        
        elements.toolbar.classList.add('fixed-position');
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

    // In fixed mode, toolbar is always displayed and has fixed-position class
    if (this.state.isFixed) {
        this.elements.toolbar.classList.add('visible');
        this.elements.toolbar.classList.add('fixed-position');
    } else {
        this.elements.toolbar.classList.toggle('visible', this.state.isVisible);
        this.elements.toolbar.classList.remove('fixed-position');
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
    if (this.state.isVisible || this.state.isFixed) {
        this.updatePosition();
    }
} 