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

export function updatePosition(
    config: ToolbarConfig,
    state: ToolbarState,
    elements: ToolbarElements,
    debug: (message: string, data?: any) => void
): void {
    if (!elements.toolbar) return;

    if (!state.isFixed) {
        handleFloatingMode(config, state, elements);
    } else {
        handleFixedMode(config, state, elements, debug);
    }
}

function handleFloatingMode(
    config: ToolbarConfig,
    state: ToolbarState,
    elements: ToolbarElements
): void {
    if (!state.selectionRect || !elements.toolbar) return;

    const rect = state.selectionRect;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Get the content wrapper for relative positioning
    const contentWrapper = elements.toolbar.closest('.content-wrapper');
    if (!contentWrapper) {
        console.error('FloatingToolbar: Content wrapper not found');
        return;
    }
    const wrapperRect = contentWrapper.getBoundingClientRect();

    // Get toolbar dimensions
    const toolbarRect = elements.toolbar.getBoundingClientRect();
    const toolbarWidth = toolbarRect.width;
    const toolbarHeight = toolbarRect.height;

    // Calculate positions relative to the content wrapper
    let relativeTop = rect.top - wrapperRect.top;
    let relativeLeft = rect.left - wrapperRect.left + (rect.width / 2);

    // Calculate if we have enough space above the selection
    const spaceAbove = rect.top;
    const spaceBelow = viewportHeight - rect.bottom;
    const shouldPositionBelow = spaceAbove < toolbarHeight + config.offset.y;

    // Ensure toolbar stays within horizontal bounds
    const minLeft = toolbarWidth / 2;
    const maxLeft = wrapperRect.width - (toolbarWidth / 2);
    relativeLeft = Math.max(minLeft, Math.min(relativeLeft, maxLeft));

    // Set position
    elements.toolbar.style.left = `${relativeLeft}px`;

    if (shouldPositionBelow) {
        // Position below selection
        let bottomPosition = relativeTop + rect.height + config.offset.y;

        // Check if toolbar would go below viewport
        if (rect.bottom + toolbarHeight + config.offset.y > viewportHeight) {
            // Position above selection instead
            bottomPosition = relativeTop - toolbarHeight - config.offset.y;
        }

        elements.toolbar.style.top = `${bottomPosition}px`;
        elements.toolbar.style.transform = 'translate(-50%, 0)';
    } else {
        // Position above selection
        let topPosition = relativeTop - config.offset.y;

        // Check if toolbar would go above viewport
        if (rect.top - toolbarHeight - config.offset.y < 0) {
            // Position below selection instead
            topPosition = relativeTop + rect.height + config.offset.y;
        }

        elements.toolbar.style.top = `${topPosition}px`;
        elements.toolbar.style.transform = 'translate(-50%, -100%)';
    }

    // Update classes
    elements.toolbar.classList.toggle('below', shouldPositionBelow);
    elements.toolbar.classList.add('following-selection');
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
    const contentArea = document.querySelector<HTMLElement>(config.selector || '');
    const toolbarContainer = elements.toolbar.closest('.toolbar-container');
    const contentWrapper = elements.toolbar.closest('.content-wrapper');

    if (!contentWrapper || !contentArea || !toolbarContainer) {
        console.error('FloatingToolbar: Required elements not found');
        return;
    }

    if (!hasSelection) {
        debug('Fixed Mode: No selection - resetting to default position', {
            isFixed: state.isFixed,
            isAtFixedPosition: state.isAtFixedPosition
        });

        resetToFixedPosition(state, elements);
    } else if (state.selectionRect) {
        handleFixedModeWithSelection(
            config,
            state,
            elements,
            contentArea,
            toolbarContainer as HTMLElement,
            contentWrapper as HTMLElement,
            debug
        );
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

function handleFixedModeWithSelection(
    config: ToolbarConfig,
    state: ToolbarState,
    elements: ToolbarElements,
    contentArea: HTMLElement,
    toolbarContainer: HTMLElement,
    contentWrapper: HTMLElement,
    debug: (message: string, data?: any) => void
): void {
    if (!elements.toolbar || !state.selectionRect) return;

    // Store current width before any changes
    const currentWidth = elements.toolbar.offsetWidth;
    elements.toolbar.style.setProperty('--toolbar-width', `${currentWidth}px`);

    const rect = state.selectionRect;
    const toolbarRect = elements.toolbar.getBoundingClientRect();
    const containerRect = toolbarContainer.getBoundingClientRect();
    const contentWrapperRect = contentWrapper.getBoundingClientRect();

    // Log viewport measurements
    const measurements: ViewportMeasurements = {
        window: {
            innerHeight: window.innerHeight,
            innerWidth: window.innerWidth,
            scrollY: window.scrollY,
            pageYOffset: window.pageYOffset
        },
        viewport: {
            top: 0,
            bottom: window.innerHeight,
            visualTop: window.visualViewport?.offsetTop || 0,
            visualHeight: window.visualViewport?.height || window.innerHeight
        },
        contentArea: {
            rect: contentArea.getBoundingClientRect(),
            offsetTop: contentArea.offsetTop,
            offsetHeight: contentArea.offsetHeight,
            scrollTop: contentArea.scrollTop
        },
        container: {
            rect: contentWrapperRect,
            offsetTop: (contentWrapper as HTMLElement).offsetTop,
            offsetHeight: (contentWrapper as HTMLElement).offsetHeight,
            scrollTop: (contentWrapper as HTMLElement).scrollTop
        },
        toolbar: {
            rect: elements.toolbar.getBoundingClientRect(),
            offsetTop: elements.toolbar.offsetTop,
            offsetHeight: elements.toolbar.offsetHeight
        }
    };
    debug('Viewport and Window Measurements', measurements);

    // Calculate space availability
    const spaceCalculations: SpaceCalculations = {
        selectionTopFromViewport: rect.top,
        selectionBottomFromViewport: rect.bottom,
        toolbarTotalHeight: toolbarRect.height + config.offset.y,
        viewportHeight: window.innerHeight,
        visualViewportHeight: window.visualViewport?.height || window.innerHeight,
        spaceAboveSelection: rect.top,
        spaceBelowSelection: window.innerHeight - rect.bottom,
        containerTopOffset: containerRect.top,
        containerBottomOffset: containerRect.bottom
    };
    debug('Detailed Space Calculations', spaceCalculations);

    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldPositionBelow = spaceAbove < (toolbarRect.height + config.offset.y);

    // Calculate the center position relative to the content area
    let left = rect.left + (rect.width / 2) - contentWrapperRect.left;

    // Ensure the toolbar stays within the content area bounds
    const minLeft = currentWidth / 2;
    const maxLeft = contentWrapperRect.width - currentWidth / 2;
    left = Math.max(minLeft, Math.min(left, maxLeft));

    debug('Fixed Mode: Horizontal positioning', {
        originalLeft: rect.left + (rect.width / 2) - contentWrapperRect.left,
        constrainedLeft: left,
        bounds: { min: minLeft, max: maxLeft },
        containerWidth: contentWrapperRect.width
    });

    // Calculate final position relative to container
    const relativeLeft = left - (currentWidth / 2);
    const top = shouldPositionBelow
        ? (rect.top - contentWrapperRect.top + rect.height + config.offset.y)
        : (rect.top - contentWrapperRect.top - toolbarRect.height - config.offset.y);

    debug('Fixed Mode: Final position', {
        top,
        relativeLeft,
        shouldPositionBelow,
        isFollowingSelection: true
    });

    // Position the toolbar
    elements.toolbar.classList.remove('fixed-position');
    elements.toolbar.classList.add('following-selection');
    elements.toolbar.classList.toggle('below', shouldPositionBelow);
    state.isAtFixedPosition = false;

    elements.toolbar.style.position = 'absolute';
    elements.toolbar.style.top = `${top}px`;
    elements.toolbar.style.left = `${relativeLeft}px`;
    elements.toolbar.style.transform = 'none';
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

    // In fixed mode, toolbar is always displayed
    if (this.state.isFixed) {
        this.elements.toolbar.classList.add('visible');
    } else {
        this.elements.toolbar.classList.toggle('visible', this.state.isVisible);
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