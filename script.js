import { createToolbarHTML } from './dist/ui/toolbarHTML.js';
import { setupEventListeners, destroyEventListeners } from './dist/core/eventManager.js';
import { updatePosition, resetToolbar, updateView } from './dist/ui/positioning.js';
import { cacheElements } from './dist/utils/elements.js';
import { setupStructure } from './dist/ui/structure.js';
import { handleSelection, hasSelection } from './dist/handlers/selection/index.js';
import { 
    handleLinkButtonClick, 
    handleSaveLinkClick, 
    handleCancelLinkClick, 
    handleRemoveLinkClick,
    handleLinkInputChange,
    handleVisitLinkClick,
    updateVisitButton,
    checkForExistingLink
} from './dist/handlers/link/index.js';
import { 
    handleFormat, 
    updateFormatButtonStates, 
    clearFormatButtonStates 
} from './dist/handlers/formatting/index.js';

export class FloatingToolbar {
    constructor(config = {}, { addRequiredStyles, addToolbarStyles } = {}) {
        // Store the style functions
        this.addRequiredStyles = addRequiredStyles || (() => {});
        this.addToolbarStyles = addToolbarStyles || (() => {});

        // Modern default configuration
        const defaultConfig = {
            container: '.content-wrapper',
            content: '.content',
            mode: 'floating',
            theme: 'dark',
            debug: false,
            useExistingToolbar: false,
            // Keep existing button configuration structure for now
            buttons: {
                text: {
                    bold: true,
                    italic: true,
                    underline: true,
                    strikethrough: true
                },
                script: {
                    subscript: true,
                    superscript: true
                },
                heading: {
                    h1: true,
                    h2: true
                },
                special: {
                    dropCap: true,
                    code: true,
                    quote: true,
                    hr: true
                },
                list: {
                    bullet: true,
                    number: true
                },
                link: {
                    url: true
                }
            },
            // Keep existing position configuration
            offset: { x: 0, y: 10 },
            fixedPosition: {
                top: 0,
                center: true
            }
        };

        // Merge configurations while preserving backward compatibility
        this.config = {
            ...defaultConfig,
            ...config,
            // Ensure backward compatibility with existing code
            selector: config.content || config.selector || defaultConfig.content,
            toolbarId: config.toolbarId || 'floating-toolbar',
            resizeDebounceMs: config.resizeDebounceMs || 150
        };

        // Keep existing state management
        this.state = {
            isVisible: this.config.mode === 'fixed',
            currentView: 'initial',
            currentSelection: null,
            selectedText: '',
            selectionRange: null,
            position: { x: 0, y: 0 },
            selectionRect: null,
            existingLink: null,
            resizeTimeout: null,
            activeFormats: new Set(),
            dropCapElements: new Set(),
            isProcessingLinkClick: false,
            isFixed: this.config.mode === 'fixed',
            isAtFixedPosition: true
        };

        // Keep existing elements cache
        this.elements = {
            toolbar: null,
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

        // Bind imported handlers to this instance
        this.handleSelection = handleSelection.bind(this);
        this.handleLinkButtonClick = handleLinkButtonClick.bind(this);
        this.handleSaveLinkClick = handleSaveLinkClick.bind(this);
        this.handleCancelLinkClick = handleCancelLinkClick.bind(this);
        this.handleRemoveLinkClick = handleRemoveLinkClick.bind(this);
        this.handleLinkInputChange = handleLinkInputChange.bind(this);
        this.handleVisitLinkClick = handleVisitLinkClick.bind(this);
        this.handleFormat = handleFormat.bind(this);
        this.hasSelection = hasSelection.bind(this);
        this.updateVisitButton = updateVisitButton.bind(this);
        this.updateFormatButtonStates = updateFormatButtonStates.bind(this);
        this.clearFormatButtonStates = clearFormatButtonStates.bind(this);
        this.updateView = updateView.bind(this);
        this.checkForExistingLink = checkForExistingLink.bind(this);

        // Find target element and set up structure
        const targetElement = document.querySelector(this.config.selector);
        if (!targetElement) {
            console.error(`FloatingToolbar: Target element with selector "${this.config.selector}" not found`);
            return;
        }

        // Set up the structure and initialize
        setupStructure(targetElement, this.config, this.state, this.addRequiredStyles);
        this.initialize();
    }

    // Initialize the toolbar
    initialize() {
        // Add toolbar styles
        this.addToolbarStyles();
        
        // Cache DOM elements
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
        if (this.state.isFixed) {
            this.elements.toolbar.classList.add('floating-toolbar');
            this.elements.toolbar.classList.add('fixed-position');
        } else {
            this.elements.toolbar.classList.add('floating-toolbar');
            this.elements.toolbar.classList.remove('fixed-position');
        }
        
        // Initial state setup
        console.log("Selection state:", {
            isVisible: this.state.isVisible,
            selectionRect: this.state.selectionRect,
            selectedText: this.state.selectedText
          });
          
        this.updateView();
    }



    // Update toolbar position
    updatePosition() {
        updatePosition(this.config, this.state, this.elements, this.debug.bind(this));
    }

    // Debug logging utility
    debug(message, data = null) {
        if (this.config.debug) {
            if (data) {
                console.log(`FloatingToolbar Debug - ${message}:`, data);
            } else {
                console.log(`FloatingToolbar Debug - ${message}`);
            }
        }
    }

    // Public API methods
    destroy() {
        destroyEventListeners(
            this.state,
            this.elements,
            {
                handleSelection: this.handleSelection,
                handleFormat: this.handleFormat,
                handleLinkButtonClick: this.handleLinkButtonClick,
                handleSaveLinkClick: this.handleSaveLinkClick,
                handleCancelLinkClick: this.handleCancelLinkClick,
                handleRemoveLinkClick: this.handleRemoveLinkClick,
                handleVisitLinkClick: this.handleVisitLinkClick,
                hasSelection: this.hasSelection
            }
        );
    }

    resetToolbar() {
        if (this.state.isFixed) {
            resetToolbar(this.state, this.elements, this.clearFormatButtonStates);
        } else {
            // For floating toolbars, just hide them
            this.state.isVisible = false;
            this.updateView();
        }
    }
} 