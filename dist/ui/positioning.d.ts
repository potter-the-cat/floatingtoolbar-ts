import { ToolbarConfig, ToolbarState, ToolbarElements } from '../core/types.js';
export declare function updatePosition(config: ToolbarConfig, state: ToolbarState, elements: ToolbarElements, debug: (message: string, data?: any) => void): void;
export declare function resetToolbar(state: ToolbarState, elements: ToolbarElements, clearFormatButtonStates: () => void): void;
