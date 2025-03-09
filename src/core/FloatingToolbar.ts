import { createToolbarHTML } from '../ui/toolbarHTML';
import { setupEventListeners, destroyEventListeners } from './eventManager';
import { updatePosition, resetToolbar, updateView } from '../ui/positioning';
import { cacheElements } from '../utils/elements';
import { setupStructure } from '../ui/structure';
import { initialize } from './initialize';
import { 
    handleSelection, 
    hasSelection, 
    handlePaste 
} from '../handlers/selection';
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
    public handlePaste: (e: ClipboardEvent) => void;
    public handleFormat: (format: FormatType) => void;
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
                },
                font: {
                    enabled: true
                },
                alignment: {
                    left: true,
                    center: true,
                    right: true,
                    justify: true
                }
            },
            offset: { x: 0, y: 10 },
            persistentPosition: {
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
            resizeDebounceMs: config.resizeDebounceMs || defaultConfig.resizeDebounceMs,
            persistentPosition: {
                top: 0,
                center: true,
                ...config.persistentPosition
            }
        };

        // Initialize state
        this.state = {
            isVisible: this.config.mode === 'persistent',
            isPersistent: this.config.mode === 'persistent',
            isAtPersistentPosition: this.config.mode === 'persistent',
            currentView: 'initial',
            selectedText: null,
            selectionRect: null,
            selectionRange: null,
            currentSelection: null,
            existingLink: null,
            linkUrl: '',
            isValidUrl: false,
            toolbarRect: null,
            wrapperRect: null,
            spaceAbove: 0,
            spaceBelow: 0,
            isProcessingLinkClick: false,
            positionObserver: null,
            activeFormats: new Set(),
            dropCapElements: new Set()
        };

        // Initialize elements cache
        this.elements = {
            toolbar: null,
            container: null,
            toolbarInitial: null,
            toolbarLinkInput: null,
            toolbarFontSelect: null,
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
            numberListButton: null,
            fontButton: null,
            fontList: null,
            alignLeftButton: null,
            alignCenterButton: null,
            alignRightButton: null,
            alignJustifyButton: null,
            buttons: {
                bold: { element: null, enabled: undefined },
                italic: { element: null, enabled: undefined },
                underline: { element: null, enabled: undefined },
                strikethrough: { element: null, enabled: undefined },
                subscript: { element: null, enabled: undefined },
                superscript: { element: null, enabled: undefined },
                h1: { element: null, enabled: undefined },
                h2: { element: null, enabled: undefined },
                dropCap: { element: null, enabled: undefined },
                code: { element: null, enabled: undefined },
                quote: { element: null, enabled: undefined },
                hr: { element: null, enabled: undefined },
                bulletList: { element: null, enabled: undefined },
                numberList: { element: null, enabled: undefined },
                font: { element: null, enabled: undefined },
                alignLeft: { element: null, enabled: undefined },
                alignCenter: { element: null, enabled: undefined },
                alignRight: { element: null, enabled: undefined },
                alignJustify: { element: null, enabled: undefined }
            }
        };

        // Bind methods
        this.handleSelection = handleSelection.bind(this);
        this.handleLinkButtonClick = handleLinkButtonClick.bind(this);
        this.handleSaveLinkClick = handleSaveLinkClick.bind(this);
        this.handleCancelLinkClick = handleCancelLinkClick.bind(this);
        this.handleRemoveLinkClick = handleRemoveLinkClick.bind(this);
        this.handleLinkInputChange = handleLinkInputChange.bind(this);
        this.handleVisitLinkClick = handleVisitLinkClick.bind(this);
        this.handlePaste = handlePaste.bind(this);
        this.handleFormat = handleFormat.bind(this);
        this.hasSelection = hasSelection.bind(this);
        this.updateVisitButton = updateVisitButton.bind(this);
        this.updateFormatButtonStates = updateFormatButtonStates.bind(this);
        this.clearFormatButtonStates = clearFormatButtonStates.bind(this);
        this.updateView = updateView.bind(this);
        this.checkForExistingLink = checkForExistingLink.bind(this);
        this.initialize = initialize.bind(this as any);
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