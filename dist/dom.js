import { requiredStyles } from './styles.js';
/**
 * Find the closest element matching a selector
 */
export function findClosestElement(node, selector) {
    let element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    if (!element)
        return null;
    return element.closest(selector);
}
/**
 * Find the closest anchor element from a node
 */
export function findClosestLink(element) {
    if (!element)
        return null;
    return element.closest('a');
}
/**
 * Create an element with optional class name
 */
export function createElement(tag, className) {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    return element;
}
/**
 * Add required styles to the document
 */
export function addRequiredStyles() {
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
export function addToolbarStyles(toolbarId) {
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

            #${toolbarId}:not(.fixed-position) {
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

            #${toolbarId}:not(.fixed-position) .toolbar-initial {
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
export function addStylesheet(id, cssContent) {
    if (!document.getElementById(id)) {
        const style = document.createElement('style');
        style.id = id;
        style.textContent = cssContent;
        document.head.appendChild(style);
    }
}
