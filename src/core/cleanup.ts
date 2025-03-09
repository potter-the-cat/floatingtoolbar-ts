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
        if (key === 'buttons') {
            // Handle buttons separately
            const buttons = elements.buttons;
            Object.keys(buttons).forEach(buttonKey => {
                buttons[buttonKey as keyof typeof buttons].element = null;
                buttons[buttonKey as keyof typeof buttons].enabled = undefined;
            });
        } else {
            (elements[key as keyof ToolbarElements] as any) = null;
        }
    });

    // Reset state
    state.isVisible = false;
    state.currentView = 'initial';
    state.selectedText = null;
    state.selectionRect = null;
    state.existingLink = null;
    state.isProcessingLinkClick = false;
    state.isAtPersistentPosition = false;
} 