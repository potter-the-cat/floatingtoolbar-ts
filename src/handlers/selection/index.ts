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
        isPersistent: this.state.isPersistent,
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
                toolbar.classList.add('persistent-position');
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
        
        // Clear selection state but preserve position if editing a link
        if (this.state.currentView === 'linkInput') {
            this.state.currentSelection = null;
            this.state.selectedText = '';
            this.state.selectionRange = null;
            // Keep isVisible true and preserve existingLink
            this.state.isVisible = true;
            // Don't reset currentView or existingLink
        } else {
            // Full reset for non-link states
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
            // Ensure toolbar stays visible and follows selection for existing links
            if (this.elements.toolbar) {
                this.elements.toolbar.classList.add('visible');
                this.elements.toolbar.classList.add('following-selection');
                this.elements.toolbar.classList.remove('persistent-position');
                this.state.isAtPersistentPosition = false;
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

/**
 * Handles paste events to preserve formatting from external sources
 * @param this SelectionHandlerContext
 * @param event ClipboardEvent
 */
export function handlePaste(
    this: SelectionHandlerContext,
    event: ClipboardEvent
): void {
    // Prevent default paste behavior
    event.preventDefault();
    
    // Get clipboard data
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;
    
    // Try to get HTML content first (this preserves formatting)
    let content = clipboardData.getData('text/html');
    const plainText = clipboardData.getData('text/plain');
    
    this.debug('Paste event detected', {
        hasHtml: !!content,
        htmlLength: content?.length,
        plainTextLength: plainText?.length
    });
    
    if (content) {
        // Sanitize the HTML content
        content = sanitizeHtml(content);
        
        // Insert the sanitized HTML at the current selection
        insertHtmlAtSelection(content);
    } else if (plainText) {
        // Fall back to plain text if no HTML is available
        document.execCommand('insertText', false, plainText);
    }
    
    // Update the toolbar state to reflect any formatting in the pasted content
    this.updateFormatButtonStates();
    this.updateView();
}

/**
 * Sanitizes HTML content from clipboard to ensure it's safe and compatible
 * @param html The HTML content to sanitize
 * @returns Sanitized HTML
 */
function sanitizeHtml(html: string): string {
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove potentially harmful elements and attributes
    const elementsToRemove = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'];
    elementsToRemove.forEach(tag => {
        const elements = tempDiv.querySelectorAll(tag);
        elements.forEach(el => el.remove());
    });
    
    // Remove event handlers and javascript: URLs
    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(el => {
        // Remove all attributes that start with "on" (event handlers)
        Array.from(el.attributes).forEach(attr => {
            if (attr.name.startsWith('on') || (attr.name === 'href' && attr.value.toLowerCase().startsWith('javascript:'))) {
                el.removeAttribute(attr.name);
            }
        });
    });
    
    // Map external formatting to our internal format
    mapExternalFormatting(tempDiv);
    
    return tempDiv.innerHTML;
}

/**
 * Maps external formatting (from Word, Google Docs, etc.) to our internal format
 * @param container The container element with the pasted content
 */
function mapExternalFormatting(container: HTMLElement): void {
    // Google Docs specific formatting
    const googleDocsSpans = container.querySelectorAll('span[style*="font-weight: 700"], span[style*="font-weight:700"]');
    googleDocsSpans.forEach(span => {
        const strong = document.createElement('strong');
        strong.innerHTML = span.innerHTML;
        span.parentNode?.replaceChild(strong, span);
    });
    
    // Microsoft Word specific formatting
    // Word often uses specific class names or mso- prefixed styles
    const wordElements = container.querySelectorAll('[class*="Mso"], [style*="mso-"]');
    wordElements.forEach(el => {
        // Convert Word's specific formatting to standard HTML
        const style = (el as HTMLElement).style;
        
        // Handle font-weight
        if (style.fontWeight === 'bold' || parseInt(style.fontWeight) >= 700) {
            const strong = document.createElement('strong');
            strong.innerHTML = el.innerHTML;
            el.parentNode?.replaceChild(strong, el);
        }
        
        // Handle italics
        if (style.fontStyle === 'italic') {
            const em = document.createElement('em');
            em.innerHTML = el.innerHTML;
            el.parentNode?.replaceChild(em, el);
        }
        
        // Handle underline
        if (style.textDecoration === 'underline') {
            const u = document.createElement('u');
            u.innerHTML = el.innerHTML;
            el.parentNode?.replaceChild(u, el);
        }
    });
}

/**
 * Inserts HTML content at the current selection
 * @param html The HTML content to insert
 */
function insertHtmlAtSelection(html: string): void {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    range.deleteContents();
    
    // Create a fragment with the HTML content
    const fragment = range.createContextualFragment(html);
    range.insertNode(fragment);
    
    // Move the cursor to the end of the inserted content
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
} 