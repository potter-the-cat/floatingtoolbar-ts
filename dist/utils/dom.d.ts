/**
 * Find the closest element matching a selector
 */
export declare function findClosestElement(node: Node, selector: string): Element | null;
/**
 * Find the closest anchor element from a node
 */
export declare function findClosestLink(element: Element | null): HTMLAnchorElement | null;
/**
 * Create an element with optional class name
 */
export declare function createElement(tag: string, className?: string): HTMLElement;
/**
 * Add required styles to the document
 */
export declare function addRequiredStyles(): void;
/**
 * Add toolbar-specific styles
 */
export declare function addToolbarStyles(toolbarId: string): void;
/**
 * Add a stylesheet to the document
 */
export declare function addStylesheet(id: string, cssContent: string): void;
