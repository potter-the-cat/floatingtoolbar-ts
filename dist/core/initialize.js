import { cacheElements } from '../utils/elements.js';
import { setupEventListeners } from './eventManager.js';
export function initialize() {
    // Add toolbar styles first
    this.addToolbarStyles();
    // Cache DOM elements with properly bound debug function
    this.elements = cacheElements(this.config, this.debug.bind(this));
    // Set up event listeners
    setupEventListeners(this.config, this.state, this.elements, {
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
    });
    // Set initial mode class
    if (this.elements.toolbar) {
        this.elements.toolbar.classList.add('floating-toolbar');
        this.elements.toolbar.classList.toggle('fixed-position', this.state.isFixed);
        this.elements.toolbar.classList.add(`theme-${this.config.theme}`);
        // Force a reflow to ensure styles are applied
        void this.elements.toolbar.offsetHeight;
    }
    // Initial state setup
    this.debug("Selection state:", {
        isVisible: this.state.isVisible,
        selectionRect: this.state.selectionRect,
        selectedText: this.state.selectedText
    });
    this.updateView();
}
//# sourceMappingURL=initialize.js.map