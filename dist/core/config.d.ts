/**
 * Text formatting button configuration
 */
export interface TextFormatButtons {
    /** Enable bold text formatting */
    bold: boolean;
    /** Enable italic text formatting */
    italic: boolean;
    /** Enable underline text formatting */
    underline: boolean;
    /** Enable strikethrough text formatting */
    strikethrough: boolean;
}
/**
 * Script button configuration for subscript and superscript
 */
export interface ScriptFormatButtons {
    /** Enable subscript text formatting */
    subscript: boolean;
    /** Enable superscript text formatting */
    superscript: boolean;
}
/**
 * Heading button configuration
 */
export interface HeadingFormatButtons {
    /** Enable H1 heading formatting */
    h1: boolean;
    /** Enable H2 heading formatting */
    h2: boolean;
}
/**
 * Special formatting button configuration
 */
export interface SpecialFormatButtons {
    /** Enable drop cap formatting */
    dropCap: boolean;
    /** Enable code block formatting */
    code: boolean;
    /** Enable blockquote formatting */
    quote: boolean;
    /** Enable horizontal rule insertion */
    hr: boolean;
}
/**
 * List formatting button configuration
 */
export interface ListFormatButtons {
    /** Enable bullet list formatting */
    bullet: boolean;
    /** Enable numbered list formatting */
    number: boolean;
}
/**
 * Link button configuration
 */
export interface LinkFormatButtons {
    /** Enable URL linking */
    url: boolean;
}
/**
 * Complete button configuration for the toolbar
 */
export interface ToolbarButtonConfig {
    /** Text formatting buttons configuration */
    text: TextFormatButtons;
    /** Script formatting buttons configuration */
    script?: ScriptFormatButtons;
    /** Heading formatting buttons configuration */
    heading?: HeadingFormatButtons;
    /** Special formatting buttons configuration */
    special?: SpecialFormatButtons;
    /** List formatting buttons configuration */
    list?: ListFormatButtons;
    /** Link formatting buttons configuration */
    link?: LinkFormatButtons;
}
/**
 * Position offset configuration
 */
export interface ToolbarOffset {
    /** Horizontal offset in pixels */
    x: number;
    /** Vertical offset in pixels */
    y: number;
}
/**
 * Fixed position configuration for the toolbar
 */
export interface FixedPositionConfig {
    /** Distance from the top of the container in pixels */
    top: number;
    /** Whether to center the toolbar horizontally */
    center: boolean;
}
/**
 * Theme configuration for the toolbar
 */
export type ToolbarTheme = 'dark' | 'light';
/**
 * Mode configuration for the toolbar
 */
export type ToolbarMode = 'floating' | 'fixed';
/**
 * Base configuration for the floating toolbar
 */
export interface BaseToolbarConfig {
    /** CSS selector for the container element */
    container: string;
    /** CSS selector for the content element */
    content: string;
    /** CSS selector for the target element (optional, falls back to content) */
    selector?: string;
    /** Toolbar display mode */
    mode: ToolbarMode;
    /** Toolbar theme */
    theme: ToolbarTheme;
    /** Enable debug logging */
    debug: boolean;
    /** Use an existing toolbar element instead of creating a new one */
    useExistingToolbar: boolean;
    /** Button configuration */
    buttons: ToolbarButtonConfig;
    /** Position offset configuration */
    offset: ToolbarOffset;
    /** Fixed position configuration */
    fixedPosition: FixedPositionConfig;
    /** Unique ID for the toolbar element */
    toolbarId: string;
    /** Debounce time for resize events in milliseconds */
    resizeDebounceMs: number;
}
/**
 * Complete configuration for the floating toolbar, extending the base configuration
 */
export interface FloatingToolbarConfig extends BaseToolbarConfig {
    /** Default values that should always be present */
    toolbarId: string;
    resizeDebounceMs: number;
}
/**
 * Style injection options
 */
export interface StyleOptions {
    /** Function to add required base styles */
    addRequiredStyles?: () => void;
    /** Function to add toolbar-specific styles */
    addToolbarStyles?: () => void;
}
/**
 * Default configuration values
 */
export declare const DEFAULT_CONFIG: FloatingToolbarConfig;
