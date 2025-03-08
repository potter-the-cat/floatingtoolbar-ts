import { ToolbarConfig, ToolbarState, ToolbarElements } from './types';
export interface InitializeContext {
    config: ToolbarConfig;
    state: ToolbarState;
    elements: ToolbarElements;
    debug: (message: string, data?: any) => void;
    addToolbarStyles: () => void;
    updateView: () => void;
    handleSelection: (event: Event) => void;
    handleFormat: (format: string) => void;
    handleLinkButtonClick: (e: MouseEvent) => void;
    handleSaveLinkClick: (e: MouseEvent) => void;
    handleCancelLinkClick: (e: MouseEvent) => void;
    handleRemoveLinkClick: (e: MouseEvent) => void;
    handleVisitLinkClick: (e: MouseEvent) => void;
    handleLinkInputChange: (e: Event) => void;
    hasSelection: () => boolean;
    updatePosition: () => void;
    resetToolbar: () => void;
}
export declare function initialize(this: InitializeContext): void;
