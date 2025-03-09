import { ToolbarState, ToolbarElements } from './types';

export function destroy(
    state: ToolbarState,
    elements: ToolbarElements
): void {
    // Disconnect the position observer
    if (state.positionObserver) {
        state.positionObserver.disconnect();
        state.positionObserver = null;
    }

    // Remove the toolbar element if it exists
    if (elements.toolbar) {
        elements.toolbar.remove();
    }

    // Clear all element references
    Object.keys(elements).forEach(key => {
        elements[key as keyof ToolbarElements] = null;
    });

    // Reset state
    state.isVisible = false;
    state.currentView = 'initial';
    state.selectedText = null;
    state.selectionRect = null;
    state.existingLink = null;
    state.isProcessingLinkClick = false;
    state.isAtFixedPosition = false;
} 