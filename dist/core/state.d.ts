/**
 * View states for the toolbar
 */
export type ToolbarView = 'initial' | 'linkInput';
/**
 * Position coordinates for the toolbar
 */
export interface ToolbarPosition {
    /** X coordinate in pixels */
    x: number;
    /** Y coordinate in pixels */
    y: number;
}
/**
 * Active format tracking
 */
export interface FormatState {
    /** Set of currently active format types */
    activeFormats: Set<string>;
    /** Set of elements with drop cap formatting */
    dropCapElements: Set<HTMLElement>;
}
/**
 * Selection state tracking
 */
export interface SelectionState {
    /** Current selection object */
    currentSelection: Selection | null;
    /** Selected text content */
    selectedText: string;
    /** Selection range object */
    selectionRange: Range | null;
    /** Bounding rectangle of the selection */
    selectionRect: DOMRect | null;
}
/**
 * Link state tracking
 */
export interface LinkState {
    /** Currently active link element */
    existingLink: HTMLAnchorElement | null;
    /** Whether a link click is being processed */
    isProcessingLinkClick: boolean;
}
/**
 * Position state tracking
 */
export interface PositionState {
    /** Whether the toolbar is fixed */
    isFixed: boolean;
    /** Whether the toolbar is at its fixed position */
    isAtFixedPosition: boolean;
    /** Current position coordinates */
    position: ToolbarPosition;
}
/**
 * Visibility state tracking
 */
export interface VisibilityState {
    /** Whether the toolbar is visible */
    isVisible: boolean;
    /** Current view state of the toolbar */
    currentView: ToolbarView;
}
/**
 * Resize handling state
 */
export interface ResizeState {
    /** Timeout ID for resize debouncing */
    resizeTimeout: number | null;
}
/**
 * Complete toolbar state
 */
export interface ToolbarState extends FormatState, SelectionState, LinkState, PositionState, VisibilityState, ResizeState {
}
/**
 * Initial state factory
 * @param isFixed - Whether the toolbar is in fixed mode
 * @returns Initial toolbar state
 */
export declare function createInitialState(isFixed: boolean): ToolbarState;
/**
 * State update types
 */
export type StateUpdateFunction<K extends keyof ToolbarState> = (prevState: ToolbarState[K]) => ToolbarState[K];
/**
 * State update options
 */
export interface StateUpdateOptions {
    /** Whether to trigger a view update */
    updateView?: boolean;
    /** Whether to trigger a position update */
    updatePosition?: boolean;
}
/**
 * State update result
 */
export interface StateUpdateResult {
    /** Whether the state was actually changed */
    changed: boolean;
    /** Previous state value */
    previousValue: any;
    /** New state value */
    newValue: any;
}
/**
 * State validation functions
 */
export declare const stateValidators: {
    /**
     * Validates selection state
     */
    validateSelection(state: SelectionState): boolean;
    /**
     * Validates position state
     */
    validatePosition(state: PositionState): boolean;
    /**
     * Validates link state
     */
    validateLink(state: LinkState): boolean;
};
/**
 * State debug helpers
 */
export declare const stateDebug: {
    /**
     * Gets a summary of the current state
     */
    getStateSummary(state: ToolbarState): Record<string, any>;
};
