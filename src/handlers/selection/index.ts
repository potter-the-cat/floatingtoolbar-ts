import { ToolbarConfig, ToolbarState, ToolbarElements } from '../../core/types.js';

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
    event: MouseEvent | KeyboardEvent
): void {
    const contentArea = document.querySelector<HTMLElement>(this.config.selector || this.config.content);
    if (!contentArea) return;

    // Add toolbar identification logging
    this.debug('Handling selection for toolbar', {
        toolbarId: this.config.toolbarId,
        contentSelector: this.config.selector || this.config.content,
        isFixed: this.state.isFixed,
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

    // Ignore clicks on the toolbar
    if (this.elements.toolbar && 'type' in event && event.type === 'mouseup' && 
        this.elements.toolbar.contains(event.target as Node)) return;

    // Don't interfere with link button processing
    if (this.state.isProcessingLinkClick) {
        this.debug("Ignoring selection event during link processing");
        return;
    }

    const selection = window.getSelection();
    if (!selection) return;
    
    const selectedText = selection.toString().trim();

    // Check if the click is outside the content area and toolbar
    const clickedOutside = 'type' in event && event.type === 'mouseup' && 
        this.elements.toolbar && !this.elements.toolbar.contains(event.target as Node) && 
        !contentArea.contains(event.target as Node);

    if (clickedOutside) {
        // Clear selection state
        this.state.currentSelection = null;
        this.state.selectedText = '';
        this.state.selectionRange = null;
        this.state.isVisible = this.state.isFixed;
        this.state.existingLink = null;
        this.state.currentView = 'initial';
        this.clearFormatButtonStates();
        
        // Remove width constraint when returning to fixed position
        if (this.elements.toolbar) {
            this.elements.toolbar.style.removeProperty('--toolbar-width');
            this.elements.toolbar.classList.remove('following-selection');
        }
        
        this.updateView();
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
        }

    } else if (this.elements.toolbar && !this.elements.toolbar.contains(event.target as Node)) {
        this.state.currentSelection = null;
        this.state.selectedText = '';
        this.state.selectionRange = selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;
        this.state.isVisible = this.state.isFixed;
        this.state.existingLink = null;
        if (!this.state.isProcessingLinkClick) {
            this.state.currentView = 'initial';
        }
        
        // Remove width constraint when no selection
        if (this.elements.toolbar) {
            this.elements.toolbar.style.removeProperty('--toolbar-width');
            this.elements.toolbar.classList.remove('following-selection');
        }
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