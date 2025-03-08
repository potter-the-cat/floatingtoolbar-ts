import { ToolbarConfig, ToolbarState, ToolbarElements, SelectionHandlerContext, LinkHandlerContext, FormatHandlerContext, InitializeContext } from './types';
interface ButtonConfig {
    text: {
        bold: boolean;
        italic: boolean;
        underline: boolean;
        strikethrough: boolean;
    };
    script: {
        subscript: boolean;
        superscript: boolean;
    };
    heading: {
        h1: boolean;
        h2: boolean;
    };
    special: {
        dropCap: boolean;
        code: boolean;
        quote: boolean;
        hr: boolean;
    };
    list: {
        bullet: boolean;
        number: boolean;
    };
    link: {
        url: boolean;
    };
}
interface FloatingToolbarConfig extends ToolbarConfig {
    container: string;
    content: string;
    mode: 'floating' | 'fixed';
    theme: 'dark' | 'light';
    debug: boolean;
    useExistingToolbar: boolean;
    buttons: ButtonConfig;
    selector?: string;
    toolbarId: string;
    resizeDebounceMs: number;
}
interface StyleOptions {
    addRequiredStyles?: () => void;
    addToolbarStyles?: () => void;
}
export declare class FloatingToolbar implements SelectionHandlerContext, LinkHandlerContext, FormatHandlerContext, InitializeContext {
    config: FloatingToolbarConfig;
    state: ToolbarState;
    elements: ToolbarElements;
    private addRequiredStyles;
    addToolbarStyles: () => void;
    handleSelection: (event: Event) => void;
    handleLinkButtonClick: (e: MouseEvent) => void;
    handleSaveLinkClick: (e: MouseEvent) => void;
    handleCancelLinkClick: (e: MouseEvent) => void;
    handleRemoveLinkClick: (e: MouseEvent) => void;
    handleLinkInputChange: (e: Event) => void;
    handleVisitLinkClick: (e: MouseEvent) => void;
    handleFormat: (format: string) => void;
    hasSelection: () => boolean;
    updateVisitButton: (url: string) => void;
    updateFormatButtonStates: () => void;
    clearFormatButtonStates: () => void;
    updateView: () => void;
    checkForExistingLink: (selection: Selection) => HTMLAnchorElement | null;
    initialize: () => void;
    resetToolbar: () => void;
    constructor(config?: Partial<FloatingToolbarConfig>, { addRequiredStyles, addToolbarStyles }?: StyleOptions);
    updatePosition(): void;
    debug(...args: any[]): void;
}
export {};
