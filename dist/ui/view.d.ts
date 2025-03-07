import { ToolbarConfig, ToolbarState, ToolbarElements } from '../core/types.js';
export interface ViewHandlerContext {
    config: ToolbarConfig;
    state: ToolbarState;
    elements: ToolbarElements;
    debug: (message: string, data?: any) => void;
    updatePosition: () => void;
    updateVisitButton: (url: string) => void;
}
export declare function updateView(this: ViewHandlerContext): void;
