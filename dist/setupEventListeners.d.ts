import { ToolbarConfig, ToolbarState, ToolbarElements, FormatType } from './types';
interface EventHandlers {
    handleSelection: (e: Event) => void;
    handleFormat: (format: FormatType) => void;
    handleLinkButtonClick: (e: MouseEvent) => void;
    handleSaveLinkClick: (e: MouseEvent) => void;
    handleCancelLinkClick: (e: MouseEvent) => void;
    handleRemoveLinkClick: (e: MouseEvent) => void;
    handleVisitLinkClick: (e: MouseEvent) => void;
    handleLinkInputChange: (e: Event) => void;
    hasSelection: () => boolean;
    updateView: () => void;
    updatePosition: () => void;
    resetToolbar: () => void;
}
export declare function setupEventListeners(config: ToolbarConfig, state: ToolbarState, elements: ToolbarElements, handlers: EventHandlers): void;
export declare function destroyEventListeners(state: ToolbarState, elements: ToolbarElements, handlers: {
    handleSelection: (e: Event) => void;
    handleFormat: (format: string) => void;
    handleLinkButtonClick: (e: MouseEvent) => void;
    handleSaveLinkClick: (e: MouseEvent) => void;
    handleCancelLinkClick: (e: MouseEvent) => void;
    handleRemoveLinkClick: (e: MouseEvent) => void;
    handleVisitLinkClick: (e: MouseEvent) => void;
    hasSelection: () => boolean;
}): void;
export {};
