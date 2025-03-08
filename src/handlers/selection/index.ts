import { ToolbarConfig, ToolbarState, ToolbarElements } from '../../core/types';

export interface SelectionHandlerContext {
    config: ToolbarConfig;
    state: ToolbarState;
    elements: ToolbarElements;
    debug: (message: string, data?: any) => void;
    updateView: () => void;
    updateFormatButtonStates: () => void;
    clearFormatButtonStates: () => void;
    checkForExistingLink: (selection: Selection) => HTMLAnchorElement | null;
}

export function handleSelection(
    this: SelectionHandlerContext,
    event: MouseEvent | KeyboardEvent | Event
): void {
    const contentArea = document.querySelector<HTMLElement>(this.config.selector || this.config.content);
    if (!contentArea) return;

    // Add toolbar identification logging
    this.debug('Handling selection for toolbar', {
        toolbarId: this.config.toolbarId,
        contentSelector: this.config.selector || this.config.content,
        isFixed: this.state.isFixed,
        eventType: event.type,
        allToolbars: Array.from(document.querySelectorAll('.floating-toolbar')).map(t => t.id)
    });

    // Reset other toolbars when we start a new selection
    if ('type' in event && event.type === 'mouseup' && contentArea.contains(event.target as Node)) {
        // Store the current width before any changes
        const currentWidth = this.elements.toolbar?.getBoundingClientRect().width;
        if (currentWidth && this.elements.toolbar) {
            this.elements.toolbar.style.setProperty('--toolbar-width', `${currentWidth}px`);
        }
        
        document.querySelectorAll<HTMLElement>('.floating-toolbar').forEach(toolbar => {
            this.debug('Found toolbar during reset', {
                toolbarId: toolbar.id,
                isCurrentToolbar: toolbar === this.elements.toolbar,
                classList: Array.from(toolbar.classList)
            });
            
            if (toolbar !== this.elements.toolbar) {
                // Reset other toolbars to their default state
                toolbar.classList.add('fixed-position');
                toolbar.style.position = 'absolute';
                toolbar.style.top = '0';
                toolbar.style.left = '50%';
                toolbar.style.transform = 'translateX(-50%)';
            }
        });
    }

    // If clicking on the toolbar, preserve the current state
    if (this.elements.toolbar && 'type' in event && event.type === 'mouseup' && 
        this.elements.toolbar.contains(event.target as Node)) {
        this.debug('Preserving state for toolbar click');
        // Keep the current selection and visibility state
        return;
    }

    const selection = window.getSelection();
    if (!selection) return;
    
    const selectedText = selection.toString().trim();

    // Add detailed debug logging
    this.debug('Selection state', {
        eventType: event.type,
        selectedText,
        isProcessingLink: this.state.isProcessingLinkClick,
        hasExistingLink: !!this.state.existingLink,
        currentView: this.state.currentView,
        isVisible: this.state.isVisible,
        currentSelection: !!this.state.currentSelection,
        selectionRange: !!this.state.selectionRange
    });

    // Only handle selection clearing if we're not processing a link and not clicking the toolbar
    if (!selectedText && !this.state.isProcessingLinkClick && 
        !(this.elements.toolbar && 'target' in event && this.elements.toolbar.contains(event.target as Node))) {
        
        // Don't clear if we have an existing link and we're in link input view
        if (this.state.existingLink && this.state.currentView === 'linkInput') {
            this.debug('Preserving state for existing link');
            return;
        }
        
        // Clear selection state
        this.state.currentSelection = null;
        this.state.selectedText = '';
        this.state.selectionRange = null;
        this.state.isVisible = false;
        this.state.existingLink = null;
        this.state.currentView = 'initial';
        this.clearFormatButtonStates();
        
        // Remove width constraint and hide toolbar
        if (this.elements.toolbar) {
            this.elements.toolbar.style.removeProperty('--toolbar-width');
            this.elements.toolbar.classList.remove('following-selection');
            this.elements.toolbar.classList.remove('visible');
        }
        
        this.updateView();
    }

    // Don't update selection state if processing link click
    if (this.state.isProcessingLinkClick) {
        this.debug("Preserving selection state during link processing");
        return;
    }

    if (selectedText && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        // Only proceed if selection is within our content area
        if (!contentArea.contains(range.commonAncestorContainer)) {
            return;
        }

        // Store current width before any changes if not already stored
        if (this.elements.toolbar && !this.elements.toolbar.style.getPropertyValue('--toolbar-width')) {
            const currentWidth = this.elements.toolbar.getBoundingClientRect().width;
            this.elements.toolbar.style.setProperty('--toolbar-width', `${currentWidth}px`);
        }

        this.state.selectionRect = range.getBoundingClientRect();
        this.state.currentSelection = selection;
        this.state.selectedText = selectedText;
        this.state.selectionRange = range.cloneRange();
        this.state.isVisible = true;
        
        // Check for existing link
        const existingLink = this.checkForExistingLink(selection);
        if (existingLink) {
            this.state.existingLink = existingLink;
            this.state.currentView = 'linkInput';
            if (this.elements.linkInput) {
                this.elements.linkInput.value = existingLink.href;
            }
            // Ensure toolbar stays visible for existing links
            if (this.elements.toolbar) {
                this.elements.toolbar.classList.add('visible');
            }
        } else {
            this.state.existingLink = null;
            this.state.currentView = 'initial';
            if (this.elements.linkInput) {
                this.elements.linkInput.value = '';
            }
        }
        
        // Add following-selection class to maintain width
        if (this.elements.toolbar) {
            this.elements.toolbar.classList.add('following-selection');
            this.elements.toolbar.classList.add('visible');
        }

        this.updateFormatButtonStates();
        this.updateView();
        return;
    }

    this.updateFormatButtonStates();
    this.updateView();
}

export function hasSelection(this: SelectionHandlerContext): boolean {
    const selection = window.getSelection();
    if (!selection || !selection.toString().trim().length) return false;
    
    // Check if the selection is within our content area
    const contentArea = document.querySelector<HTMLElement>(this.config.selector || this.config.content);
    if (!contentArea) return false;

    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        return contentArea.contains(range.commonAncestorContainer);
    }
    return false;
} 