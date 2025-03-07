import { ToolbarConfig, ToolbarState, ToolbarElements } from '../types';
export interface LinkHandlerContext {
    config: ToolbarConfig;
    state: ToolbarState;
    elements: ToolbarElements;
    debug: (message: string, data?: any) => void;
    updateView: () => void;
}
export declare function handleLinkButtonClick(this: LinkHandlerContext, e: MouseEvent): void;
export declare function handleSaveLinkClick(this: LinkHandlerContext, e: MouseEvent): void;
export declare function handleCancelLinkClick(this: LinkHandlerContext, e: MouseEvent): void;
export declare function handleRemoveLinkClick(this: LinkHandlerContext, e: MouseEvent): void;
export declare function handleLinkInputChange(this: LinkHandlerContext, e: Event): void;
export declare function handleVisitLinkClick(this: LinkHandlerContext, e: MouseEvent): void;
export declare function updateVisitButton(this: LinkHandlerContext, url: string): void;
export declare function checkForExistingLink(this: LinkHandlerContext, selection: Selection): HTMLAnchorElement | null;
