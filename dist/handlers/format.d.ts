import { ToolbarConfig, ToolbarState, ToolbarElements, FormatType } from '../types';
export interface FormatHandlerContext {
    config: ToolbarConfig;
    state: ToolbarState;
    elements: ToolbarElements;
    debug: (message: string, data?: any) => void;
    updateView: () => void;
}
export declare function handleFormat(this: FormatHandlerContext, format: FormatType): void;
export declare function handleHeading(this: FormatHandlerContext, level: 'h1' | 'h2'): void;
export declare function handleDropCap(this: FormatHandlerContext): void;
export declare function handleCode(this: FormatHandlerContext): void;
export declare function handleQuote(this: FormatHandlerContext): void;
export declare function handleHorizontalRule(this: FormatHandlerContext): void;
export declare function updateFormatButtonStates(this: FormatHandlerContext): void;
export declare function clearFormatButtonStates(this: FormatHandlerContext): void;
