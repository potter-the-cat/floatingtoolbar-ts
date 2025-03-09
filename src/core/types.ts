export interface TextButtons {
    fonts?: string[];
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
}

export interface ScriptButtons {
    subscript?: boolean;
    superscript?: boolean;
}

export interface HeadingButtons {
    h1?: boolean;
    h2?: boolean;
}

export interface SpecialButtons {
    dropCap?: boolean;
    code?: boolean;
    quote?: boolean;
    hr?: boolean;
}

export interface ListButtons {
    bullet?: boolean;
    number?: boolean;
}

export interface LinkButtons {
    url?: boolean;
}

export interface AlignmentButtons {
    left?: boolean;
    center?: boolean;
    right?: boolean;
    justify?: boolean;
}

export interface FontButtons {
    enabled: boolean;
}

export interface FontConfig {
    defaultFonts: string[];
    googleFonts?: {
        families: string[];
        display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
    };
}

export interface ToolbarButtons {
    text: TextButtons;
    script?: ScriptButtons;
    heading?: HeadingButtons;
    special?: SpecialButtons;
    list?: ListButtons;
    link?: LinkButtons;
    font?: FontButtons;
    alignment?: AlignmentButtons;
}

export interface ToolbarOffset {
    x: number;
    y: number;
}

export interface PersistentPosition {
    top: number;
    center?: boolean;
}

export interface ToolbarConfig {
    container: string;
    content: string;
    selector?: string;
    mode: 'floating' | 'persistent';
    theme: string;
    debug: boolean;
    useExistingToolbar: boolean;
    buttons: ToolbarButtons;
    offset: ToolbarOffset;
    persistentPosition: PersistentPosition;
    toolbarId: string;
    resizeDebounceMs: number;
    fontConfig?: FontConfig;
}

export interface ToolbarState {
    isVisible: boolean;
    isPersistent: boolean;
    isAtPersistentPosition: boolean;
    currentView: 'initial' | 'linkInput' | 'fontSelect' | null;
    selectedText: string | null;
    selectionRect: DOMRect | null;
    selectionRange: Range | null;
    currentSelection: Selection | null;
    existingLink: HTMLAnchorElement | null;
    linkUrl: string;
    isValidUrl: boolean;
    toolbarRect: DOMRect | null;
    wrapperRect: DOMRect | null;
    spaceAbove: number;
    spaceBelow: number;
    isProcessingLinkClick: boolean;
    positionObserver: IntersectionObserver | null;
    position?: { x: number; y: number };
    resizeTimeout?: number;
    activeFormats?: Set<string>;
    dropCapElements?: Set<HTMLElement>;
    currentFont?: string;
    loadedGoogleFonts?: Set<string>;
}

export interface ToolbarElements {
    toolbar: HTMLElement | null;
    container: HTMLElement | null;
    toolbarInitial: HTMLElement | null;
    toolbarLinkInput: HTMLElement | null;
    toolbarFontSelect: HTMLDivElement | null;
    linkButton: HTMLButtonElement | null;
    linkInput: HTMLInputElement | null;
    saveLink: HTMLButtonElement | null;
    cancelLink: HTMLButtonElement | null;
    removeLink: HTMLButtonElement | null;
    visitLink: HTMLButtonElement | null;
    boldButton: HTMLButtonElement | null;
    italicButton: HTMLButtonElement | null;
    underlineButton: HTMLButtonElement | null;
    strikethroughButton: HTMLButtonElement | null;
    subscriptButton: HTMLButtonElement | null;
    superscriptButton: HTMLButtonElement | null;
    h1Button: HTMLButtonElement | null;
    h2Button: HTMLButtonElement | null;
    dropCapButton: HTMLButtonElement | null;
    codeButton: HTMLButtonElement | null;
    quoteButton: HTMLButtonElement | null;
    hrButton: HTMLButtonElement | null;
    bulletListButton: HTMLButtonElement | null;
    numberListButton: HTMLButtonElement | null;
    fontButton: HTMLButtonElement | null;
    fontList: HTMLDivElement | null;
    alignLeftButton: HTMLButtonElement | null;
    alignCenterButton: HTMLButtonElement | null;
    alignRightButton: HTMLButtonElement | null;
    alignJustifyButton: HTMLButtonElement | null;
    buttons: ButtonElements;
}

export interface ButtonConfig {
    text: {
        bold: boolean;
        italic: boolean;
        underline: boolean;
        strikethrough: boolean;
    };
    script: {
        subscript: boolean;
        superscript: boolean;
    };
    heading: {
        h1: boolean;
        h2: boolean;
    };
    special: {
        dropCap: boolean;
        code: boolean;
        quote: boolean;
        hr: boolean;
    };
    list: {
        bullet: boolean;
        number: boolean;
    };
    link: {
        url: boolean;
    };
    font: {
        enabled: boolean;
    };
    alignment: {
        left: boolean;
        center: boolean;
        right: boolean;
        justify: boolean;
    };
}

export type ButtonConfigs = Record<FormatType, ButtonConfig>;

export type FormatType = 
    | 'bold' 
    | 'italic' 
    | 'underline' 
    | 'strikethrough'
    | 'subscript'
    | 'superscript'
    | 'h1'
    | 'h2'
    | 'dropCap'
    | 'code'
    | 'quote'
    | 'hr'
    | 'bulletList'
    | 'numberList'
    | 'font'
    | 'alignLeft'
    | 'alignCenter'
    | 'alignRight'
    | 'alignJustify';

declare global {
    interface Window {
        ensureValidUrl: (url: string) => string;
        isValidUrl: (url: string) => boolean;
        findClosestLink: (node: Node | null) => HTMLAnchorElement | null;
    }
}

export {};

/**
 * Interface for style management operations
 */
export interface StyleManager {
    injectRequiredStyles(): void;
    injectToolbarStyles(): void;
    cleanup(): void;
}

/**
 * Interface for link utility functions
 */
export interface LinkUtils {
    findClosestLink(node: Node | null): HTMLAnchorElement | null;
    isValidUrl(url: string): boolean;
    ensureValidUrl(url: string): string;
}

/**
 * Theme options for the toolbar
 */
export type ThemeType = 'dark' | 'light' | 'custom';

/**
 * View states for the toolbar
 */
export type ViewType = 'initial' | 'linkInput';

/**
 * Position configuration for the toolbar
 */
export interface Position {
    x: number;
    y: number;
}

/**
 * Selection state interface
 */
export interface SelectionState {
    range: Range | null;
    rect: DOMRect | null;
    text: string;
}

export interface BaseHandlerContext {
    config: ToolbarConfig;
    state: ToolbarState;
    elements: ToolbarElements;
    debug: (...args: any[]) => void;
}

export interface SelectionHandlerContext extends BaseHandlerContext {
    updateView: () => void;
    updatePosition: () => void;
    resetToolbar: () => void;
}

export interface LinkHandlerContext extends BaseHandlerContext {
    updateView: () => void;
    updatePosition: () => void;
}

export interface FormatHandlerContext extends BaseHandlerContext {
    updateView: () => void;
    updatePosition: () => void;
}

export interface InitializeContext extends BaseHandlerContext {
    resetToolbar: () => void;
    handleFormat: (format: FormatType) => void;
}

export interface PositionConfig {
    offset: { x: number; y: number };
    persistentPosition: {
        top: number;
        center: boolean;
    };
}

export interface FloatingToolbarConfig extends ToolbarConfig {
    container: string;
    content: string;
    mode: 'floating' | 'persistent';
    theme: 'dark' | 'light';
    debug: boolean;
    useExistingToolbar: boolean;
    buttons: ButtonConfig;
    selector?: string;
    toolbarId: string;
    resizeDebounceMs: number;
}

export interface ButtonElement {
    element: HTMLButtonElement | null;
    enabled: boolean | undefined;
}

export type ButtonElements = Record<FormatType, ButtonElement>;

export const defaultConfig: ToolbarConfig = {
    container: '',
    content: '',
    selector: '',
    mode: 'floating',
    theme: '',
    debug: false,
    useExistingToolbar: false,
    buttons: {
        text: {},
        script: {},
        heading: {},
        special: {},
        list: {},
        link: {},
        font: {
            enabled: false
        }
    },
    offset: { x: 0, y: 0 },
    persistentPosition: {
        top: 0,
        center: true
    },
    toolbarId: '',
    resizeDebounceMs: 0
};

// Default configuration for buttons
export const defaultButtonConfig: ButtonConfig = {
    text: {
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false
    },
    script: {
        subscript: false,
        superscript: false
    },
    heading: {
        h1: false,
        h2: false
    },
    special: {
        dropCap: false,
        code: false,
        quote: false,
        hr: false
    },
    list: {
        bullet: false,
        number: false
    },
    link: {
        url: false
    },
    font: {
        enabled: false
    },
    alignment: {
        left: false,
        center: false,
        right: false,
        justify: false
    }
};

export interface ToolbarContext {
    config: ToolbarConfig;
    state: ToolbarState;
    elements: ToolbarElements;
    debug: (message: string) => void;
    updateView: () => void;
    updateFormatButtonStates: () => void;
}
