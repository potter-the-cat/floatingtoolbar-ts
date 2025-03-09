import { requiredStyles } from '../ui/styles';

/**
 * Find the closest element matching a selector
 */
export function findClosestElement(node: Node, selector: string): Element | null {
    let element = node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement;
    
    if (!element) return null;
    
    return element.closest(selector);
}

/**
 * Find the closest anchor element from a node
 */
export function findClosestLink(element: Element | null): HTMLAnchorElement | null {
    if (!element) return null;
    return element.closest('a') as HTMLAnchorElement;
}

/**
 * Create an element with optional class name
 */
export function createElement(tag: string, className?: string): HTMLElement {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    return element;
}

/**
 * Add required styles to the document
 */
export function addRequiredStyles(): void {
    const styleId = 'floating-toolbar-required-styles';
    
    // Check if styles are already added
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = requiredStyles;
        document.head.appendChild(style);
    }
}

/**
 * Add toolbar-specific styles
 */
export function addToolbarStyles(toolbarId: string): void {
    const styleId = `floating-toolbar-styles-${toolbarId}`;
    
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            #${toolbarId}::after {
                content: '';
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 6px solid var(--toolbar-bg);
                bottom: -6px;
                transition: top 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                            bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                will-change: top, bottom;
            }

            #${toolbarId}.below::after {
                border-top: none;
                border-bottom: 6px solid var(--toolbar-bg);
                bottom: auto;
                top: -6px;
            }

            #${toolbarId}:not(.persistent-position) {
                max-width: min(100vw - 40px, 800px);
            }

            #${toolbarId} .toolbar-initial {
                display: flex;
                align-items: center;
                gap: 4px;
                flex-wrap: nowrap;
                width: 100%;
            }

            #${toolbarId} .toolbar-group {
                display: flex;
                gap: 4px;
                flex-wrap: nowrap;
            }

            #${toolbarId}:not(.persistent-position) .toolbar-initial {
                flex-wrap: nowrap;
            }

            #${toolbarId} .toolbar-link-input {
                display: none;
                align-items: center;
                gap: 4px;
                padding: 4px;
                flex-wrap: wrap;
            }

            #${toolbarId} .link-input {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                color: white;
                padding: 4px 8px;
                font-size: 14px;
                min-width: 200px;
            }

            #${toolbarId} .link-input:focus {
                outline: none;
                border-color: rgba(255, 255, 255, 0.4);
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Add a stylesheet to the document
 */
export function addStylesheet(id: string, cssContent: string): void {
    if (!document.getElementById(id)) {
        const style = document.createElement('style');
        style.id = id;
        style.textContent = cssContent;
        document.head.appendChild(style);
    }
}