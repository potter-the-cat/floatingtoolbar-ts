import { ToolbarConfig, ToolbarState, ToolbarElements, FormatType } from '../../core/types';

export interface FormatHandlerContext {
    config: ToolbarConfig;
    state: ToolbarState;
    elements: ToolbarElements;
    debug: (message: string, data?: any) => void;
    updateView: () => void;
}

export function handleFormat(
    this: FormatHandlerContext,
    format: FormatType
): void {
    if (!this.state.selectionRange) return;

    let command: string;
    switch (format) {
        case 'bold':
            command = 'bold';
            break;
        case 'italic':
            command = 'italic';
            break;
        case 'underline':
            command = 'underline';
            break;
        case 'strikethrough':
            command = 'strikeThrough';
            break;
        case 'subscript':
            command = 'subscript';
            break;
        case 'superscript':
            command = 'superscript';
            break;
        case 'h1':
        case 'h2':
            handleHeading.call(this, format);
            return;
        case 'dropCap':
            handleDropCap.call(this);
            return;
        case 'code':
            handleCode.call(this);
            return;
        case 'quote':
            handleQuote.call(this);
            return;
        case 'hr':
            handleHorizontalRule.call(this);
            return;
        case 'bulletList':
            command = 'insertUnorderedList';
            break;
        case 'numberList':
            command = 'insertOrderedList';
            break;
        default:
            return;
    }

    try {
        // Restore the stored selection before applying format
        const selection = window.getSelection();
        if (!selection) return;
        
        selection.removeAllRanges();
        selection.addRange(this.state.selectionRange);

        // Apply the formatting
        document.execCommand(command, false, '');

        // Update button states
        updateFormatButtonStates.call(this);

        // Store the updated range
        this.state.selectionRange = selection.getRangeAt(0).cloneRange();
        this.state.selectionRect = this.state.selectionRange.getBoundingClientRect();

        // Keep the toolbar visible and update its position
        this.state.isVisible = true;
        this.updateView();

        this.debug(`Applied ${format} formatting`);
    } catch (error) {
        console.error(`Error applying ${format} format:`, error);
    }
}

export function handleHeading(
    this: FormatHandlerContext,
    level: 'h1' | 'h2'
): void {
    const selection = window.getSelection();
    if (!selection || !this.state.selectionRange) return;
    
    selection.removeAllRanges();
    selection.addRange(this.state.selectionRange);

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const parentElement = container.nodeType === 3 ? container.parentElement : container as HTMLElement;
    if (!parentElement) return;

    // Check if we're already in a heading of this level
    const currentHeading = (parentElement as HTMLElement).closest(`h${level.slice(-1)}`);
    if (currentHeading) {
        // Remove the heading by replacing it with its content
        document.execCommand('formatBlock', false, 'P');
    } else {
        // Create new heading
        document.execCommand('formatBlock', false, level.toUpperCase());
    }

    // Update selection and state
    const newSelection = window.getSelection();
    if (!newSelection) return;
    
    this.state.selectionRange = newSelection.getRangeAt(0).cloneRange();
    this.state.selectionRect = this.state.selectionRange.getBoundingClientRect();
    updateFormatButtonStates.call(this);
}

export function handleDropCap(
    this: FormatHandlerContext
): void {
    const selection = window.getSelection();
    if (!selection || !this.state.selectionRange) return;
    
    selection.removeAllRanges();
    selection.addRange(this.state.selectionRange);

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    
    // Find the block-level parent (paragraph or div)
    let blockParent: Node | null = container;
    while (blockParent && 
           (blockParent.nodeType !== 1 || 
            !['P', 'DIV'].includes((blockParent as Element).tagName))) {
        const nextParent: ParentNode | null = blockParent.parentNode;
        if (!nextParent) break;
        blockParent = nextParent as Node;
    }

    if (!blockParent) return;

    // Toggle drop cap class
    const element = blockParent as HTMLElement;
    if (element.classList.contains('drop-cap')) {
        element.classList.remove('drop-cap');
        this.state.dropCapElements.delete(element);
    } else {
        element.classList.add('drop-cap');
        this.state.dropCapElements.add(element);
    }

    // Update format button states
    updateFormatButtonStates.call(this);
}

export function handleCode(
    this: FormatHandlerContext
): void {
    const selection = window.getSelection();
    if (!selection || !this.state.selectionRange) return;
    
    selection.removeAllRanges();
    selection.addRange(this.state.selectionRange);

    const range = selection.getRangeAt(0);
    
    // Helper function to find code element
    const findCodeElement = (node: Node | null): HTMLElement | null => {
        while (node && node.nodeType) {
            if (node.nodeType === 1) {
                const element = node as HTMLElement;
                if (element.tagName === 'CODE') {
                    return element;
                }
            }
            node = node.parentNode;
        }
        return null;
    };

    // Check for code elements in the selection
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;
    const currentCode = findCodeElement(startContainer) || findCodeElement(endContainer);

    this.debug('Code button clicked. Current state', {
        startContainer: startContainer,
        endContainer: endContainer,
        hasCodeElement: !!currentCode,
        selectedText: selection.toString()
    });

    if (currentCode) {
        this.debug('Removing code formatting from', {
            element: currentCode,
            content: currentCode.textContent
        });
        
        // Get the text content and parent before removing the code element
        const textContent = currentCode.textContent;
        const parent = currentCode.parentNode;
        if (!parent) return;
        
        // Replace the code element with its text content
        const textNode = document.createTextNode(textContent || '');
        parent.replaceChild(textNode, currentCode);
        
        // Create a new range for the text node
        const newRange = document.createRange();
        newRange.setStart(textNode, 0);
        newRange.setEnd(textNode, textNode.length);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        // Update stored range
        this.state.selectionRange = newRange.cloneRange();
    } else {
        this.debug('Adding code formatting to', {
            selectedText: selection.toString()
        });
        
        // Create new code element
        const codeElement = document.createElement('code');
        
        try {
            // Extract the selected content
            const fragment = range.extractContents();
            codeElement.appendChild(fragment);
            range.insertNode(codeElement);
            
            // Update selection to include the code element
            const newRange = document.createRange();
            newRange.selectNodeContents(codeElement);
            selection.removeAllRanges();
            selection.addRange(newRange);
            
            // Update stored range
            this.state.selectionRange = newRange.cloneRange();
        } catch (error) {
            console.error('Error applying code formatting:', error);
        }
    }

    // Update format button states
    updateFormatButtonStates.call(this);
}

export function handleQuote(
    this: FormatHandlerContext
): void {
    const selection = window.getSelection();
    if (!selection || !this.state.selectionRange) return;
    
    selection.removeAllRanges();
    selection.addRange(this.state.selectionRange);

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const parentElement = container.nodeType === 3 ? container.parentElement : container as HTMLElement;
    if (!parentElement) return;

    // Check if we're already in a blockquote
    const currentQuote = (parentElement as HTMLElement).closest('blockquote');
    if (currentQuote) {
        // Remove quote formatting by unwrapping the blockquote
        const fragment = document.createDocumentFragment();
        while (currentQuote.firstChild) {
            fragment.appendChild(currentQuote.firstChild);
        }
        currentQuote.parentNode?.replaceChild(fragment, currentQuote);
        
        // Convert any remaining divs to paragraphs for consistent formatting
        fragment.querySelectorAll('div').forEach(div => {
            const p = document.createElement('p');
            p.innerHTML = div.innerHTML;
            div.parentNode?.replaceChild(p, div);
        });
        
        // Normalize the parent to clean up text nodes
        parentElement.normalize();
    } else {
        // Create new blockquote
        document.execCommand('formatBlock', false, 'BLOCKQUOTE');
    }

    // Store the updated range
    const newSelection = window.getSelection();
    if (!newSelection) return;
    
    this.state.selectionRange = newSelection.getRangeAt(0).cloneRange();
    
    // Update format button states
    updateFormatButtonStates.call(this);
}

export function handleHorizontalRule(
    this: FormatHandlerContext
): void {
    const selection = window.getSelection();
    if (!selection || !this.state.selectionRange) return;
    
    selection.removeAllRanges();
    selection.addRange(this.state.selectionRange);

    // Create and insert the horizontal rule
    const hr = document.createElement('hr');
    const range = selection.getRangeAt(0);
    
    // Get the block parent to ensure we insert at a block level
    let blockParent: Node | null = range.commonAncestorContainer;
    while (blockParent && blockParent.nodeType === 3) {
        const nextParent: ParentNode | null = blockParent.parentNode;
        if (!nextParent) break;
        blockParent = nextParent as Node;
    }

    // Insert the HR after the current block
    if (blockParent && blockParent.parentNode) {
        blockParent.parentNode.insertBefore(hr, blockParent.nextSibling);
        
        // Create a new paragraph after the HR for continued editing
        const newParagraph = document.createElement('p');
        newParagraph.innerHTML = '<br>';  // Ensures the paragraph is selectable
        blockParent.parentNode.insertBefore(newParagraph, hr.nextSibling);
        
        // Move cursor to the new paragraph
        const newRange = document.createRange();
        newRange.setStart(newParagraph, 0);
        newRange.setEnd(newParagraph, 0);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        // Hide the toolbar
        this.state.isVisible = false;
        this.state.selectionRange = null;
        this.state.selectionRect = null;
        this.updateView();
    }
}

export function updateFormatButtonStates(
    this: FormatHandlerContext
): void {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    // Get the current node where the cursor or selection is
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const parentElement = container.nodeType === 3 ? container.parentElement : container as HTMLElement;
    if (!parentElement) return;

    const formats = {
        bold: this.elements.boldButton,
        italic: this.elements.italicButton,
        underline: this.elements.underlineButton,
        strikethrough: this.elements.strikethroughButton,
        subscript: this.elements.subscriptButton,
        superscript: this.elements.superscriptButton,
        insertUnorderedList: this.elements.bulletListButton,
        insertOrderedList: this.elements.numberListButton
    };

    // Check each format
    for (const [format, button] of Object.entries(formats)) {
        if (button) {  // Only process if button exists
            const isActive = document.queryCommandState(format);
            
            // Update button state
            if (isActive) {
                button.classList.add('active');
                this.state.activeFormats.add(format);
            } else {
                button.classList.remove('active');
                this.state.activeFormats.delete(format);
            }
        }
    }

    // Update heading buttons if they exist
    if (this.elements.h1Button) {
        this.elements.h1Button.classList.toggle('active', !!(parentElement as HTMLElement).closest('h1'));
    }
    if (this.elements.h2Button) {
        this.elements.h2Button.classList.toggle('active', !!(parentElement as HTMLElement).closest('h2'));
    }
    
    // Update code button if it exists
    if (this.elements.codeButton) {
        this.elements.codeButton.classList.toggle('active', !!(parentElement as HTMLElement).closest('code'));
    }
    
    // Update quote button if it exists
    if (this.elements.quoteButton) {
        this.elements.quoteButton.classList.toggle('active', !!(parentElement as HTMLElement).closest('blockquote'));
    }
    
    // Update drop cap button if it exists
    if (this.elements.dropCapButton) {
        this.elements.dropCapButton.classList.toggle('active', this.state.dropCapElements.has(parentElement as HTMLElement));
    }
}

export function clearFormatButtonStates(
    this: FormatHandlerContext
): void {
    // Clear basic format buttons
    const formats = {
        bold: this.elements.boldButton,
        italic: this.elements.italicButton,
        underline: this.elements.underlineButton,
        strikethrough: this.elements.strikethroughButton,
        subscript: this.elements.subscriptButton,
        superscript: this.elements.superscriptButton,
        insertUnorderedList: this.elements.bulletListButton,
        insertOrderedList: this.elements.numberListButton
    };

    // Remove active class from all format buttons that exist
    for (const button of Object.values(formats)) {
        if (button) {
            button.classList.remove('active');
        }
    }

    // Clear heading buttons if they exist
    if (this.elements.h1Button) {
        this.elements.h1Button.classList.remove('active');
    }
    if (this.elements.h2Button) {
        this.elements.h2Button.classList.remove('active');
    }
    
    // Clear special format buttons if they exist
    if (this.elements.codeButton) {
        this.elements.codeButton.classList.remove('active');
    }
    if (this.elements.quoteButton) {
        this.elements.quoteButton.classList.remove('active');
    }
    if (this.elements.dropCapButton) {
        this.elements.dropCapButton.classList.remove('active');
    }

    // Clear the active formats set
    this.state.activeFormats.clear();
} 