import { ToolbarContext } from '../core/types';

export function handleFontSelect(this: ToolbarContext, fontName: string): void {
    if (!this.state.selectionRange) return;
    
    document.execCommand('fontName', false, fontName);
    this.updateFormatButtonStates();
}

export function updateFontButtonState(this: ToolbarContext): void {
    if (!this.elements.fontButton) return;
    
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
        this.elements.fontButton.textContent = 'Font';
        this.elements.fontButton.classList.remove('active', 'mixed', 'system-font');
        return;
    }

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    
    // Get all text nodes in the selection
    const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                const range = document.createRange();
                range.selectNode(node);
                return selection.containsNode(node, true) ?
                    NodeFilter.FILTER_ACCEPT :
                    NodeFilter.FILTER_REJECT;
            }
        }
    );

    const fonts = new Set<string>();
    let node: Node | null;
    
    while (node = walker.nextNode()) {
        const computedStyle = window.getComputedStyle(node.parentElement as Element);
        const fontFamily = computedStyle.fontFamily;
        
        // Handle system font stacks
        if (fontFamily.includes('-apple-system') || fontFamily.includes('BlinkMacSystemFont')) {
            this.elements.fontButton.classList.add('system-font');
            this.elements.fontButton.textContent = 'System Font';
            return;
        }
        
        // Extract primary font from font stack
        const primaryFont = fontFamily.split(',')[0].replace(/["']/g, '').trim();
        fonts.add(primaryFont);
    }

    if (fonts.size === 0) {
        this.elements.fontButton.textContent = 'Font';
        this.elements.fontButton.classList.remove('active', 'mixed', 'system-font');
    } else if (fonts.size === 1) {
        const [font] = fonts;
        this.elements.fontButton.textContent = font;
        this.elements.fontButton.classList.add('active');
        this.elements.fontButton.classList.remove('mixed', 'system-font');
    } else {
        this.elements.fontButton.textContent = 'Mixed';
        this.elements.fontButton.classList.add('mixed');
        this.elements.fontButton.classList.remove('active', 'system-font');
    }
} 