import { ToolbarConfig, ToolbarState, ToolbarElements } from './types';
import { cacheElements } from '../utils/elements';
import { setupEventListeners } from './eventManager';
import { setupToolbarPositionObserver } from '../ui/positioning';
import { FontHandler } from './handlers/FontHandler';

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
    // Add toolbar styles first
    this.addToolbarStyles();
    
    // Cache DOM elements with properly bound debug function
    this.elements = cacheElements(this.config, this.debug.bind(this));
    
    // Initialize font handler if enabled
    if (this.config.buttons.font?.enabled) {
        const fontHandler = new FontHandler({
            config: this.config,
            state: this.state,
            elements: this.elements,
            updateView: this.updateView.bind(this)
        });
        fontHandler.initialize();
    }
    
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
    if (this.elements.toolbar) {
        this.elements.toolbar.classList.add('floating-toolbar');
        this.elements.toolbar.classList.toggle('persistent-position', this.state.isPersistent);
        this.elements.toolbar.classList.add(`theme-${this.config.theme}`);
        
        // Force a reflow to ensure styles are applied
        void this.elements.toolbar.offsetHeight;
    }
    
    // Set up position observer
    setupToolbarPositionObserver(
        this.config,
        this.state,
        this.elements,
        this.debug.bind(this)
    );
    
    // Initial state setup
    this.debug("Selection state:", {
        isVisible: this.state.isVisible,
        selectionRect: this.state.selectionRect,
        selectedText: this.state.selectedText
    });
      
    this.updateView();
} 