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
    if (!contentArea) {
        this.debug('Content area not found', {
            selector: this.config.selector || this.config.content
        });
        return;
    }

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

        // Store the current scroll position before updating state
        const originalScrollPosition = window.scrollY;

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
        
        // Update the view
        this.updateView();
        
        // Restore scroll position if it changed during view update
        if (window.scrollY !== originalScrollPosition) {
            window.scrollTo(0, originalScrollPosition);
        }
    }
    
    // Update format button states based on current selection
    this.updateFormatButtonStates();
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
 * Handles paste events in the editor.
 * 
 * This enhanced paste handler improves upon the browser's default paste behavior by:
 * 1. Sanitizing HTML to remove potentially harmful elements and attributes
 * 2. Mapping external formatting (from Google Docs, MS Word, etc.) to standard HTML
 * 3. Ensuring consistent behavior across different browsers
 * 4. Preserving appropriate formatting while removing unwanted styles
 * 
 * @param event - The clipboard event containing the pasted content
 */
export function handlePaste(this: SelectionHandlerContext, event: ClipboardEvent): void {
  // Prevent the default paste behavior
  event.preventDefault();
  
  // Get HTML content from clipboard if available
  let html = event.clipboardData?.getData('text/html') || '';
  
  // If HTML content is available, process it
  if (html) {
    // Sanitize the HTML to remove potentially harmful elements
    html = sanitizeHtml(html);
    
    // Map external formatting (Google Docs, MS Word) to standard HTML
    html = mapExternalFormatting(html);
    
    // Insert the processed HTML at the current selection
    insertHtmlAtSelection(html);
  } else {
    // Fall back to plain text if HTML is not available
    const text = event.clipboardData?.getData('text/plain') || '';
    document.execCommand('insertText', false, text);
  }
  
  // Update toolbar state to reflect any formatting in the pasted content
  this.updateFormatButtonStates();
  this.updateView();
}

/**
 * Sanitizes HTML content by removing potentially harmful elements and attributes.
 * 
 * This function:
 * 1. Removes script tags, event handlers, and other potentially dangerous elements
 * 2. Strips excessive inline styles that could break the editor's formatting
 * 3. Preserves essential formatting elements like bold, italic, links, etc.
 * 
 * @param html - The HTML content to sanitize
 * @returns Sanitized HTML that is safe to insert into the editor
 */
function sanitizeHtml(html: string): string {
  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Remove potentially harmful elements and attributes
  const scripts = tempDiv.querySelectorAll('script, style, meta, link, iframe, object, embed');
  scripts.forEach(el => el.remove());
  
  // Remove event handlers and javascript: URLs
  const allElements = tempDiv.querySelectorAll('*');
  allElements.forEach(el => {
    // Remove all attributes that start with "on" (event handlers)
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on') || (attr.name === 'href' && attr.value.startsWith('javascript:'))) {
        el.removeAttribute(attr.name);
      }
    });
  });
  
  return tempDiv.innerHTML;
}

/**
 * Maps external formatting from sources like Google Docs and Microsoft Word
 * to standard HTML elements and attributes.
 * 
 * This function:
 * 1. Converts Google Docs specific span elements with style attributes to standard HTML
 * 2. Transforms Microsoft Word specific classes and styles to standard HTML
 * 3. Cleans up unnecessary wrapper elements and attributes
 * 
 * @param html - The HTML content to process
 * @returns HTML with external formatting mapped to standard HTML elements
 */
function mapExternalFormatting(html: string): string {
  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Process Google Docs formatting
  // Google Docs uses spans with specific style attributes for formatting
  const spans = tempDiv.querySelectorAll('span[style]');
  spans.forEach(span => {
    const style = span.getAttribute('style') || '';
    
    // Convert font-weight to <strong> elements
    if (style.includes('font-weight:700') || style.includes('font-weight:bold')) {
      const strong = document.createElement('strong');
      strong.innerHTML = span.innerHTML;
      span.parentNode?.replaceChild(strong, span);
    }
    
    // Convert font-style to <em> elements
    else if (style.includes('font-style:italic')) {
      const em = document.createElement('em');
      em.innerHTML = span.innerHTML;
      span.parentNode?.replaceChild(em, span);
    }
    
    // Convert text-decoration to <u> or <s> elements
    else if (style.includes('text-decoration:underline')) {
      const u = document.createElement('u');
      u.innerHTML = span.innerHTML;
      span.parentNode?.replaceChild(u, span);
    }
    else if (style.includes('text-decoration:line-through')) {
      const s = document.createElement('s');
      s.innerHTML = span.innerHTML;
      span.parentNode?.replaceChild(s, span);
    }
  });
  
  // Process Microsoft Word formatting
  // Word uses specific classes like MsoNormal and mso- prefixed styles
  const wordElements = tempDiv.querySelectorAll('.MsoNormal, [class^="Mso"], [style*="mso-"]');
  wordElements.forEach(el => {
    // Remove Word-specific classes
    el.removeAttribute('class');
    
    // Process Word-specific styles
    const style = el.getAttribute('style') || '';
    if (style.includes('mso-bidi-font-weight:bold')) {
      const strong = document.createElement('strong');
      strong.innerHTML = el.innerHTML;
      el.parentNode?.replaceChild(strong, el);
    }
    else if (style.includes('mso-bidi-font-style:italic')) {
      const em = document.createElement('em');
      em.innerHTML = el.innerHTML;
      el.parentNode?.replaceChild(em, el);
    }
  });
  
  // Remove Google Docs specific elements
  const googleDocsElements = tempDiv.querySelectorAll('[id^="docs-internal-guid"]');
  googleDocsElements.forEach(el => {
    const parent = el.parentNode;
    if (parent) {
      while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
      }
      el.remove();
    }
  });
  
  // Clean up any remaining unnecessary elements
  const unnecessaryElements = tempDiv.querySelectorAll('meta, style, link, head, html, body');
  unnecessaryElements.forEach(el => el.remove());
  
  return tempDiv.innerHTML;
}

/**
 * Inserts HTML content at the current selection position.
 * 
 * This function:
 * 1. Uses the browser's execCommand to insert HTML at the current selection
 * 2. Ensures the insertion works consistently across different browsers
 * 3. Maintains the selection state after insertion
 * 
 * @param html - The HTML content to insert
 */
function insertHtmlAtSelection(html: string): void {
  // Use the browser's execCommand to insert the HTML
  document.execCommand('insertHTML', false, html);
} 