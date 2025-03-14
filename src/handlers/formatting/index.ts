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
        case 'alignLeft':
            command = 'justifyLeft';
            break;
        case 'alignCenter':
            command = 'justifyCenter';
            break;
        case 'alignRight':
            command = 'justifyRight';
            break;
        case 'alignJustify':
            command = 'justifyFull';
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

    // Check if we're in a list item
    const listItem = parentElement.closest('li');
    if (listItem) {
        // Store the selection details before modifying the DOM
        const selectionText = selection.toString();
        const selectionStartOffset = range.startOffset;
        const selectionEndOffset = range.endOffset;
        
        // Check if the list item already contains a heading of this level
        const currentHeading = listItem.querySelector(`h${level.slice(-1)}`);
        
        if (currentHeading) {
            // If heading exists, replace it with its content
            const headingContent = currentHeading.innerHTML;
            listItem.innerHTML = headingContent;
        } else {
            // If no heading, wrap content in a heading
            const content = listItem.innerHTML;
            listItem.innerHTML = `<${level}>${content}</${level}>`;
        }
        
        // Restore selection after DOM modification
        try {
            // Find the text node to select
            const walker = document.createTreeWalker(
                listItem,
                NodeFilter.SHOW_TEXT,
                null
            );
            
            let node;
            let textContent = '';
            let targetNode = null;
            
            // Find the text node that contains our selection
            while (node = walker.nextNode()) {
                const nodeText = node.textContent || '';
                if (nodeText.includes(selectionText)) {
                    targetNode = node;
                    break;
                }
                textContent += nodeText;
            }
            
            if (targetNode) {
                // Create a new range for the found text node
                const newRange = document.createRange();
                newRange.setStart(targetNode, selectionStartOffset);
                newRange.setEnd(targetNode, selectionEndOffset);
                
                // Apply the new selection
                selection.removeAllRanges();
                selection.addRange(newRange);
                
                // Update the stored range
                this.state.selectionRange = newRange.cloneRange();
                this.state.selectionRect = newRange.getBoundingClientRect();
            }
        } catch (error) {
            console.error('Error restoring selection:', error);
        }
    } else {
        // Standard behavior for non-list content
        // Store the selection details before modifying the DOM
        const selectionText = selection.toString();
        
        // Check if we're already in a heading of this level
        const currentHeading = (parentElement as HTMLElement).closest(`h${level.slice(-1)}`);
        if (currentHeading) {
            // Remove the heading by replacing it with its content
            document.execCommand('formatBlock', false, 'P');
        } else {
            // Create new heading
            document.execCommand('formatBlock', false, level.toUpperCase());
        }
        
        // Ensure the selection is still active
        if (selection.rangeCount === 0 && this.state.selectionRange) {
            selection.addRange(this.state.selectionRange);
        }
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

    // Get the current node where the cursor or selection is
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const element = container.nodeType === 3 ? container.parentElement : container as HTMLElement;
    if (!element) return;

    // Find the closest paragraph
    const paragraph = element.closest('p');
    if (!paragraph) return;

    // Toggle drop cap class
    if (paragraph.classList.contains('drop-cap')) {
        paragraph.classList.remove('drop-cap');
    } else {
        paragraph.classList.add('drop-cap');
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
        insertOrderedList: this.elements.numberListButton,
        justifyLeft: this.elements.alignLeftButton,
        justifyCenter: this.elements.alignCenterButton,
        justifyRight: this.elements.alignRightButton,
        justifyFull: this.elements.alignJustifyButton
    };

    // Check each format
    for (const [format, button] of Object.entries(formats)) {
        if (button) {  // Only process if button exists
            const isActive = document.queryCommandState(format);
            
            // Update button state
            if (isActive) {
                button.classList.add('active');
                if (!this.state.activeFormats) {
                    this.state.activeFormats = new Set<string>();
                }
                this.state.activeFormats.add(format);
            } else {
                button.classList.remove('active');
                this.state.activeFormats?.delete(format);
            }
        }
    }

    // Update heading buttons if they exist
    if (this.elements.h1Button) {
        const isH1 = !!(parentElement as HTMLElement).closest('h1');
        // Check for h1 inside list item
        const listItem = (parentElement as HTMLElement).closest('li');
        const hasH1InListItem = listItem ? !!listItem.querySelector('h1') : false;
        this.elements.h1Button.classList.toggle('active', isH1 || hasH1InListItem);
    }
    if (this.elements.h2Button) {
        const isH2 = !!(parentElement as HTMLElement).closest('h2');
        // Check for h2 inside list item
        const listItem = (parentElement as HTMLElement).closest('li');
        const hasH2InListItem = listItem ? !!listItem.querySelector('h2') : false;
        this.elements.h2Button.classList.toggle('active', isH2 || hasH2InListItem);
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
        const paragraph = (parentElement as HTMLElement).closest('p');
        this.elements.dropCapButton.classList.toggle('active', paragraph?.classList.contains('drop-cap') || false);
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
        insertOrderedList: this.elements.numberListButton,
        justifyLeft: this.elements.alignLeftButton,
        justifyCenter: this.elements.alignCenterButton,
        justifyRight: this.elements.alignRightButton,
        justifyFull: this.elements.alignJustifyButton
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
    this.state.activeFormats?.clear();
} 