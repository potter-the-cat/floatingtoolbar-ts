/**
 * Manages the injection and removal of toolbar styles.
 */
export declare class ToolbarStyleManager {
    private static readonly REQUIRED_STYLES;
    private static readonly TOOLBAR_STYLES;
    /**
     * Injects the required base styles for the toolbar.
     */
    static injectRequiredStyles(): void;
    /**
     * Injects the theme styles for the toolbar.
     */
    static injectToolbarStyles(): void;
    /**
     * Removes all injected styles.
     */
    static cleanup(): void;
    /**
     * Injects a style block into the document head.
     * @param config The style configuration to inject
     */
    private static injectStyles;
}
