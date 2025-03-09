import { createToolbarHTML } from '../ui/toolbarHTML';
import { setupEventListeners, destroyEventListeners } from './eventManager';
import { updatePosition, resetToolbar, updateView } from '../ui/positioning';
import { cacheElements } from '../utils/elements';
import { setupStructure } from '../ui/structure';
import { initialize } from './initialize';
import { handleSelection, hasSelection } from '../handlers/selection';
import { 
    handleLinkButtonClick, 
    handleSaveLinkClick, 
    handleCancelLinkClick, 
    handleRemoveLinkClick,
    handleLinkInputChange,
    handleVisitLinkClick,
    updateVisitButton,
    checkForExistingLink
} from '../handlers/link';
import { 
    handleFormat, 
    updateFormatButtonStates, 
    clearFormatButtonStates
} from '../handlers/formatting';
import { 
    ToolbarConfig, 
    ToolbarState, 
    ToolbarElements, 
    FormatType,
    SelectionHandlerContext,
    LinkHandlerContext,
    FormatHandlerContext,
    InitializeContext,
    FloatingToolbarConfig,
    ButtonConfig,
    PositionConfig
} from './types';

interface StyleOptions {
    addRequiredStyles?: () => void;
    addToolbarStyles?: () => void;
}

export class FloatingToolbar implements SelectionHandlerContext, LinkHandlerContext, FormatHandlerContext, InitializeContext {
    public config: FloatingToolbarConfig;
    public state: ToolbarState;
    public elements: ToolbarElements;
    private addRequiredStyles: () => void;
    public addToolbarStyles: () => void;

    // Declare handler methods as class properties
    public handleSelection: (event: Event) => void;
    public handleLinkButtonClick: (e: MouseEvent) => void;
    public handleSaveLinkClick: (e: MouseEvent) => void;
    public handleCancelLinkClick: (e: MouseEvent) => void;
    public handleRemoveLinkClick: (e: MouseEvent) => void;
    public handleLinkInputChange: (e: Event) => void;
    public handleVisitLinkClick: (e: MouseEvent) => void;
    public handleFormat: (format: string) => void;
    public hasSelection: () => boolean;
    public updateVisitButton: (url: string) => void;
    public updateFormatButtonStates: () => void;
    public clearFormatButtonStates: () => void;
    public updateView: () => void;
    public checkForExistingLink: (selection: Selection) => HTMLAnchorElement | null;
    public initialize: () => void;
    public resetToolbar: () => void;

    constructor(config: Partial<FloatingToolbarConfig> = {}, { addRequiredStyles, addToolbarStyles }: StyleOptions = {}) {
        // Store the style functions
        this.addRequiredStyles = addRequiredStyles || (() => {});
        this.addToolbarStyles = addToolbarStyles || (() => {});

        // Modern default configuration
        const defaultConfig: FloatingToolbarConfig = {
            container: '.content-wrapper',
            content: '.content',
            mode: 'floating',
            theme: 'dark',
            debug: false,
            useExistingToolbar: false,
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
            offset: { x: 0, y: 10 },
            fixedPosition: {
                top: 0,
                center: true
            },
            toolbarId: 'floating-toolbar',
            resizeDebounceMs: 150,
            selector: '.content'  // Add default selector
        };

        // Merge configurations while preserving backward compatibility
        this.config = {
            ...defaultConfig,
            ...config,
            selector: config.content || config.selector || defaultConfig.selector,
            toolbarId: config.toolbarId || defaultConfig.toolbarId,
            resizeDebounceMs: config.resizeDebounceMs || defaultConfig.resizeDebounceMs
        };

        // Initialize state
        this.state = {
            isVisible: this.config.mode === 'fixed',
            isFixed: this.config.mode === 'fixed',
            isAtFixedPosition: this.config.mode === 'fixed',
            currentView: 'initial',
            currentSelection: null,
            selectedText: '',
            selectionRange: null,
            position: { x: 0, y: 0 },
            selectionRect: null,
            existingLink: null,
            resizeTimeout: undefined,
            activeFormats: new Set<string>(),
            dropCapElements: new Set<HTMLElement>(),
            positionObserver: null,
            isProcessingLinkClick: false
        };

        // Initialize elements cache
        this.elements = {
            toolbar: null,
            toolbarContainer: null,
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

        // Bind methods
        this.handleSelection = handleSelection.bind(this) as (event: Event) => void;
        this.handleLinkButtonClick = handleLinkButtonClick.bind(this);
        this.handleSaveLinkClick = handleSaveLinkClick.bind(this);
        this.handleCancelLinkClick = handleCancelLinkClick.bind(this);
        this.handleRemoveLinkClick = handleRemoveLinkClick.bind(this);
        this.handleLinkInputChange = handleLinkInputChange.bind(this);
        this.handleVisitLinkClick = handleVisitLinkClick.bind(this);
        this.handleFormat = handleFormat.bind(this) as (format: string) => void;
        this.hasSelection = hasSelection.bind(this);
        this.updateVisitButton = updateVisitButton.bind(this);
        this.updateFormatButtonStates = updateFormatButtonStates.bind(this);
        this.clearFormatButtonStates = clearFormatButtonStates.bind(this);
        this.updateView = updateView.bind(this);
        this.checkForExistingLink = checkForExistingLink.bind(this);
        this.initialize = initialize.bind(this);
        this.resetToolbar = () => resetToolbar(this.state, this.elements, this.clearFormatButtonStates);

        // Find target element and set up structure
        const targetElement = document.querySelector(this.config.selector!) as HTMLElement;
        if (!targetElement) {
            console.error(`FloatingToolbar: Target element with selector "${this.config.selector}" not found`);
            return;
        }

        // Set up the structure and initialize
        setupStructure(targetElement, this.config, this.state, this.addRequiredStyles);
        this.initialize();
    }

    // Update toolbar position
    public updatePosition(): void {
        updatePosition(this.config, this.state, this.elements, this.debug.bind(this));
    }

    // Debug method
    public debug(...args: any[]): void {
        if (this.config.debug) {
            console.log('[FloatingToolbar]', ...args);
        }
    }
} 