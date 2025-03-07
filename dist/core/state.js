/**
 * Initial state factory
 * @param isFixed - Whether the toolbar is in fixed mode
 * @returns Initial toolbar state
 */
export function createInitialState(isFixed) {
    return {
        // Visibility state
        isVisible: isFixed,
        currentView: 'initial',
        // Selection state
        currentSelection: null,
        selectedText: '',
        selectionRange: null,
        selectionRect: null,
        // Position state
        position: { x: 0, y: 0 },
        isFixed,
        isAtFixedPosition: true,
        // Format state
        activeFormats: new Set(),
        dropCapElements: new Set(),
        // Link state
        existingLink: null,
        isProcessingLinkClick: false,
        // Resize state
        resizeTimeout: null
    };
}
/**
 * State validation functions
 */
export const stateValidators = {
    /**
     * Validates selection state
     */
    validateSelection(state) {
        return !!(state.selectionRange &&
            state.selectedText &&
            state.selectionRect);
    },
    /**
     * Validates position state
     */
    validatePosition(state) {
        return (typeof state.position.x === 'number' &&
            typeof state.position.y === 'number' &&
            typeof state.isFixed === 'boolean' &&
            typeof state.isAtFixedPosition === 'boolean');
    },
    /**
     * Validates link state
     */
    validateLink(state) {
        return typeof state.isProcessingLinkClick === 'boolean';
    }
};
/**
 * State debug helpers
 */
export const stateDebug = {
    /**
     * Gets a summary of the current state
     */
    getStateSummary(state) {
        return {
            view: state.currentView,
            visible: state.isVisible,
            position: state.position,
            selection: {
                text: state.selectedText,
                hasRange: !!state.selectionRange,
                rect: state.selectionRect
            },
            formats: Array.from(state.activeFormats),
            link: {
                existing: !!state.existingLink,
                processing: state.isProcessingLinkClick
            }
        };
    }
};
//# sourceMappingURL=state.js.map