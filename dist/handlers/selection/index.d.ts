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
export declare function handleSelection(this: SelectionHandlerContext, event: MouseEvent | KeyboardEvent): void;
export declare function hasSelection(this: SelectionHandlerContext): boolean;
