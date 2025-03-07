import { ToolbarConfig, ToolbarState, ToolbarElements } from './types.js';
import { cacheElements } from '../utils/elements.js';
import { setupEventListeners } from './eventManager.js';

export interface InitializeContext {
    config: ToolbarConfig;
    state: ToolbarState;
    elements: ToolbarElements;
    debug: (message: string, data?: any) => void;
    addToolbarStyles: () => void;
    updateView: () => void;
    handleSelection: (event: Event) => void;
    handleFormat: (format: string) => void;
    handleLinkButtonClick: (e: MouseEvent) => void;
    handleSaveLinkClick: (e: MouseEvent) => void;
    handleCancelLinkClick: (e: MouseEvent) => void;
    handleRemoveLinkClick: (e: MouseEvent) => void;
    handleVisitLinkClick: (e: MouseEvent) => void;
    handleLinkInputChange: (e: Event) => void;
    hasSelection: () => boolean;
    updatePosition: () => void;
    resetToolbar: () => void;
}

export function initialize(
    this: InitializeContext
): void {
    // Add toolbar styles
    this.addToolbarStyles();
    
    // Cache DOM elements with properly bound debug function
    this.elements = cacheElements(this.config, this.debug.bind(this));
    
    // Set up event listeners
    setupEventListeners(
        this.config,
        this.state,
        this.elements,
        {
            handleSelection: this.handleSelection.bind(this),
            handleFormat: this.handleFormat.bind(this),
            handleLinkButtonClick: this.handleLinkButtonClick.bind(this),
            handleSaveLinkClick: this.handleSaveLinkClick.bind(this),
            handleCancelLinkClick: this.handleCancelLinkClick.bind(this),
            handleRemoveLinkClick: this.handleRemoveLinkClick.bind(this),
            handleVisitLinkClick: this.handleVisitLinkClick.bind(this),
            handleLinkInputChange: this.handleLinkInputChange.bind(this),
            hasSelection: this.hasSelection.bind(this),
            updateView: this.updateView.bind(this),
            updatePosition: this.updatePosition.bind(this),
            resetToolbar: this.resetToolbar.bind(this)
        }
    );
    
    // Set initial mode class
    if (this.state.isFixed && this.elements.toolbar) {
        this.elements.toolbar.classList.add('floating-toolbar');
        this.elements.toolbar.classList.add('fixed-position');
    } else if (this.elements.toolbar) {
        this.elements.toolbar.classList.add('floating-toolbar');
        this.elements.toolbar.classList.remove('fixed-position');
    }
    
    // Initial state setup
    this.debug("Selection state:", {
        isVisible: this.state.isVisible,
        selectionRect: this.state.selectionRect,
        selectedText: this.state.selectedText
    });
      
    this.updateView();
} 