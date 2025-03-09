import { ToolbarConfig, ToolbarState, ToolbarElements } from '../types';
import { loadGoogleFonts, isGoogleFontLoaded } from '../../utils/googleFonts';

interface FontHandlerContext {
    config: ToolbarConfig;
    state: ToolbarState;
    elements: ToolbarElements;
    updateView: () => void;
}

// Default system fonts that are commonly available
const DEFAULT_SYSTEM_FONTS = [
    'Arial',
    'Times New Roman',
    'Helvetica',
    'Georgia',
    'Verdana',
    'Tahoma',
    'Trebuchet MS',
    'Impact'
];

export class FontHandler {
    private context: FontHandlerContext;
    private initialized: boolean = false;
    private storedSelection: Range | null = null;

    constructor(context: FontHandlerContext) {
        this.context = context;
        
        // Initialize with default fonts if none provided
        if (!context.config.fontConfig) {
            context.config.fontConfig = {
                defaultFonts: DEFAULT_SYSTEM_FONTS,
                googleFonts: {
                    families: ['Libre Baskerville', 'Montserrat'],
                    display: 'swap'
                }
            };
        } else {
            // Ensure default fonts are set
            if (!context.config.fontConfig.defaultFonts) {
                context.config.fontConfig.defaultFonts = DEFAULT_SYSTEM_FONTS;
            }
            // Add Google Fonts if not configured
            if (!context.config.fontConfig.googleFonts) {
                context.config.fontConfig.googleFonts = {
                    families: ['Libre Baskerville', 'Montserrat'],
                    display: 'swap'
                };
            }
        }
    }

    private handleSelectionChange = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const currentFont = this.getCurrentFontFromSelection(range);
            if (currentFont) {
                this.context.state.currentFont = currentFont;
                this.updateFontButtonDisplay(currentFont);
            }
        }
    };

    async initialize(): Promise<void> {
        if (this.initialized) return;

        const { config, elements, state } = this.context;
        console.log('Initializing FontHandler', {
            fontEnabled: config.buttons.font?.enabled,
            hasToolbar: !!elements.toolbar,
            hasFontButton: !!elements.fontButton,
            fontButtonId: elements.fontButton?.id
        });

        if (!config.buttons.font?.enabled || !elements.toolbar) return;

        // Create font dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'toolbar-font-select';
        dropdown.style.display = 'none';
        dropdown.style.opacity = '0';
        dropdown.style.position = 'fixed';
        dropdown.style.zIndex = '10001';
        document.body.appendChild(dropdown); // Append to body instead of toolbar
        elements.toolbarFontSelect = dropdown;

        // Initialize content
        this.updateFontDropdown();

        // Add selection change listener to update font button
        document.addEventListener('selectionchange', this.handleSelectionChange);

        console.log('Created font dropdown', {
            dropdownExists: !!elements.toolbarFontSelect,
            dropdownDisplay: elements.toolbarFontSelect?.style.display,
            dropdownContent: elements.toolbarFontSelect?.innerHTML
        });

        // Initialize state for loaded Google Fonts
        state.loadedGoogleFonts = new Set();

        // Load Google Fonts if configured
        if (config.fontConfig?.googleFonts) {
            try {
                await loadGoogleFonts(config.fontConfig.googleFonts);
                // Mark fonts as loaded
                config.fontConfig.googleFonts.families.forEach(font => {
                    state.loadedGoogleFonts?.add(font);
                });
            } catch (error) {
                console.error('Error loading Google Fonts:', error);
            }
        }

        // Add event listeners
        if (elements.fontButton) {
            elements.fontButton.addEventListener('click', this.handleFontButtonClick);
        }

        this.initialized = true;
    }

    private getCurrentFontFromSelection(range: Range): string | null {
        // Get the first text node in the selection
        const nodes = this.getTextNodesInRange(range);
        if (nodes.length === 0) return null;

        // Get the font-family of the first text node's parent
        const node = nodes[0];
        let currentElement: Element | null = node.parentElement;
        
        // Walk up the DOM tree until we find a font-family style
        while (currentElement) {
            const fontFamily = window.getComputedStyle(currentElement).fontFamily;
            if (fontFamily && fontFamily !== 'inherit') {
                // Clean up the font name (remove quotes and get first font in stack)
                return fontFamily.split(',')[0].replace(/["']/g, '').trim();
            }
            currentElement = currentElement.parentElement;
        }

        return null;
    }

    handleFontButtonClick = (e: MouseEvent): void => {
        const { elements, state } = this.context;
        
        if (!elements.toolbarFontSelect || !elements.fontButton) {
            console.error('Font dropdown or button not found');
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        // Store the current selection and update font display
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            this.storedSelection = selection.getRangeAt(0).cloneRange();
            
            // Update the current font based on the selection
            const currentFont = this.getCurrentFontFromSelection(this.storedSelection);
            if (currentFont) {
                state.currentFont = currentFont;
                this.updateFontButtonDisplay(currentFont);
            }

            console.log('Stored selection', {
                text: this.storedSelection.toString(),
                startContainer: this.storedSelection.startContainer,
                endContainer: this.storedSelection.endContainer,
                currentFont: currentFont
            });
        }

        const isVisible = elements.toolbarFontSelect.classList.contains('active');

        if (!isVisible) {
            // First update the dropdown content
            this.updateFontDropdown();
            
            // Make it visible but with opacity 0
            elements.toolbarFontSelect.style.display = 'block';
            elements.toolbarFontSelect.style.opacity = '0';
            elements.toolbarFontSelect.style.visibility = 'visible';
            
            // Position the dropdown below the font button
            const buttonRect = elements.fontButton.getBoundingClientRect();
            
            // Get dimensions after content is added and display is block
            const dropdownHeight = elements.toolbarFontSelect.offsetHeight;
            const dropdownWidth = elements.toolbarFontSelect.offsetWidth;
            
            console.log('Dropdown dimensions after content', {
                dropdownHeight,
                dropdownWidth,
                content: elements.toolbarFontSelect.innerHTML,
                buttonRect
            });
            
            // Calculate position to ensure dropdown is visible
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - buttonRect.bottom;
            
            // Position vertically
            if (spaceBelow >= dropdownHeight || spaceBelow >= buttonRect.top) {
                elements.toolbarFontSelect.style.top = `${buttonRect.bottom + 4}px`;
                elements.toolbarFontSelect.style.bottom = 'auto';
            } else {
                elements.toolbarFontSelect.style.bottom = `${viewportHeight - buttonRect.top + 4}px`;
                elements.toolbarFontSelect.style.top = 'auto';
            }
            
            // Position horizontally
            const viewportWidth = window.innerWidth;
            const spaceRight = viewportWidth - buttonRect.left;
            
            if (spaceRight >= dropdownWidth) {
                elements.toolbarFontSelect.style.left = `${buttonRect.left}px`;
                elements.toolbarFontSelect.style.right = 'auto';
            } else {
                elements.toolbarFontSelect.style.right = `${viewportWidth - buttonRect.right}px`;
                elements.toolbarFontSelect.style.left = 'auto';
            }

            // Now make it visible
            requestAnimationFrame(() => {
                if (elements.toolbarFontSelect) {
                    elements.toolbarFontSelect.classList.add('active');
                    elements.toolbarFontSelect.style.opacity = '1';
                }
            });

            console.log('Positioned dropdown', {
                buttonRect,
                dropdownHeight,
                dropdownWidth,
                spaceBelow,
                spaceRight,
                viewportHeight,
                viewportWidth,
                style: {
                    top: elements.toolbarFontSelect.style.top,
                    bottom: elements.toolbarFontSelect.style.bottom,
                    left: elements.toolbarFontSelect.style.left,
                    right: elements.toolbarFontSelect.style.right,
                    display: elements.toolbarFontSelect.style.display,
                    opacity: elements.toolbarFontSelect.style.opacity,
                    visibility: elements.toolbarFontSelect.style.visibility
                }
            });

            // Add click outside listener
            document.addEventListener('click', this.handleClickOutside);
        } else {
            this.hideDropdown();
        }
    };

    private updateFontDropdown(): void {
        const { config, state, elements } = this.context;
        if (!elements.toolbarFontSelect || !config.fontConfig) return;

        // Clear existing content
        elements.toolbarFontSelect.innerHTML = '';

        // Create default fonts section
        const defaultFontsSection = document.createElement('div');
        defaultFontsSection.className = 'toolbar-font-section';
        
        const defaultFontsTitle = document.createElement('div');
        defaultFontsTitle.className = 'toolbar-font-section-title';
        defaultFontsTitle.textContent = 'System Fonts';
        defaultFontsSection.appendChild(defaultFontsTitle);

        config.fontConfig.defaultFonts.forEach(font => {
            const fontItem = this.createFontItem(font);
            defaultFontsSection.appendChild(fontItem);
        });

        elements.toolbarFontSelect.appendChild(defaultFontsSection);

        // Create Google Fonts section if configured
        if (config.fontConfig.googleFonts?.families.length) {
            const googleFontsSection = document.createElement('div');
            googleFontsSection.className = 'toolbar-font-section';
            
            const googleFontsTitle = document.createElement('div');
            googleFontsTitle.className = 'toolbar-font-section-title';
            googleFontsTitle.textContent = 'Google Fonts';
            googleFontsSection.appendChild(googleFontsTitle);

            config.fontConfig.googleFonts.families.forEach(font => {
                const fontItem = this.createFontItem(font);
                googleFontsSection.appendChild(fontItem);
            });

            elements.toolbarFontSelect.appendChild(googleFontsSection);
        }
    }

    private createFontItem(fontName: string): HTMLElement {
        const { state } = this.context;
        const item = document.createElement('div');
        item.className = 'toolbar-font-item';
        if (state.currentFont === fontName) {
            item.classList.add('active');
        }

        // Preview text with the actual font
        item.style.fontFamily = fontName;
        item.textContent = fontName;

        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Font item clicked', {
                fontName,
                currentSelection: window.getSelection()?.toString()
            });
            
            this.handleFontSelection(fontName);
        });

        return item;
    }

    handleFontSelection = (fontName: string): void => {
        const { state } = this.context;
        
        console.log('Font selection', {
            fontName,
            hasStoredSelection: !!this.storedSelection,
            storedSelectionText: this.storedSelection?.toString()
        });

        if (!this.storedSelection) {
            console.error('No stored selection found');
            return;
        }

        try {
            // Get the selected range
            const range = this.storedSelection;
            const startNode = range.startContainer;
            const endNode = range.endContainer;

            // If selection is within a single text node
            if (startNode === endNode && startNode.nodeType === Node.TEXT_NODE) {
                const textNode = startNode as Text;
                const text = textNode.textContent || '';
                const startOffset = range.startOffset;
                const endOffset = range.endOffset;

                // Split the text node if needed
                if (startOffset > 0) {
                    textNode.splitText(startOffset);
                }
                
                const middleNode = startOffset > 0 ? textNode.nextSibling as Text : textNode;
                if (endOffset < (startOffset > 0 ? middleNode.length : text.length)) {
                    middleNode.splitText(endOffset - (startOffset > 0 ? 0 : startOffset));
                }

                // Create a new span for the selected portion
                const span = document.createElement('span');
                span.style.fontFamily = fontName;
                middleNode.parentNode?.insertBefore(span, middleNode);
                span.appendChild(middleNode);

            } else {
                // For multi-node selections, handle each text node in the range
                const nodes = this.getTextNodesInRange(range);
                console.log('Found text nodes:', {
                    count: nodes.length,
                    nodes: nodes.map(n => ({ text: n.textContent, parentNode: n.parentNode?.nodeName }))
                });

                nodes.forEach((node, index) => {
                    let textNode = node;
                    
                    // Handle partial selection in first node
                    if (index === 0 && startNode === node) {
                        if (range.startOffset > 0) {
                            textNode = node.splitText(range.startOffset);
                        }
                    }
                    
                    // Handle partial selection in last node
                    if (index === nodes.length - 1 && endNode === node) {
                        if (range.endOffset < node.length) {
                            textNode.splitText(range.endOffset);
                        }
                    }

                    // Create a new span for this portion
                    const span = document.createElement('span');
                    span.style.fontFamily = fontName;
                    textNode.parentNode?.insertBefore(span, textNode);
                    span.appendChild(textNode);
                });
            }

            state.currentFont = fontName;
            this.updateFontButtonDisplay(fontName);

            console.log('Applied font', {
                fontName,
                success: true
            });
        } catch (error) {
            console.error('Error applying font:', error);
        }

        // Clear stored selection
        this.storedSelection = null;

        // Hide the dropdown
        this.hideDropdown();

        // Update the view
        this.context.updateView();
    };

    private getTextNodesInRange(range: Range): Text[] {
        const textNodes: Text[] = [];
        const iterator = document.createNodeIterator(
            range.commonAncestorContainer,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node: Node) => {
                    // Only accept text nodes that are at least partially within the range
                    if (node.nodeType === Node.TEXT_NODE) {
                        if (range.intersectsNode(node)) {
                            return NodeFilter.FILTER_ACCEPT;
                        }
                    }
                    return NodeFilter.FILTER_REJECT;
                }
            }
        );

        let node: Node | null;
        while ((node = iterator.nextNode())) {
            if (range.intersectsNode(node)) {
                textNodes.push(node as Text);
            }
        }

        return textNodes;
    }

    private handleClickOutside = (e: MouseEvent): void => {
        const { elements } = this.context;
        if (!elements.toolbarFontSelect) return;

        const target = e.target as Node;
        if (
            !elements.toolbarFontSelect.contains(target) &&
            (!elements.fontButton || !elements.fontButton.contains(target))
        ) {
            this.hideDropdown();
            // Clear stored selection when clicking outside
            this.storedSelection = null;
        }
    };

    private hideDropdown(): void {
        const { elements } = this.context;
        if (!elements.toolbarFontSelect) return;

        // First make it invisible
        elements.toolbarFontSelect.classList.remove('active');
        elements.toolbarFontSelect.style.opacity = '0';
        
        // After transition, hide it completely
        setTimeout(() => {
            if (elements.toolbarFontSelect) {
                elements.toolbarFontSelect.style.display = 'none';
            }
        }, 200); // Match the transition duration from CSS

        document.removeEventListener('click', this.handleClickOutside);
    }

    private updateFontButtonDisplay(fontName: string): void {
        const { elements } = this.context;
        if (!elements.fontButton) return;

        const fontNameElement = elements.fontButton.querySelector('.font-name');
        if (fontNameElement) {
            fontNameElement.textContent = fontName;
            (fontNameElement as HTMLElement).style.fontFamily = fontName;
        }
    }

    cleanup(): void {
        const { elements } = this.context;
        
        // Remove event listeners
        document.removeEventListener('click', this.handleClickOutside);
        document.removeEventListener('selectionchange', this.handleSelectionChange);
        if (elements.fontButton) {
            elements.fontButton.removeEventListener('click', this.handleFontButtonClick);
        }

        // Clean up font dropdown
        if (elements.toolbarFontSelect) {
            elements.toolbarFontSelect.remove();
        }
    }
} 