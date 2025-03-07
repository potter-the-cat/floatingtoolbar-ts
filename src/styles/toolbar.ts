interface StyleConfig {
    readonly id: string;
    readonly css: string;
}

/**
 * Manages the injection and removal of toolbar styles.
 */
export class ToolbarStyleManager {
    private static readonly REQUIRED_STYLES: StyleConfig = {
        id: 'floating-toolbar-required-styles',
        css: `
            .toolbar-container {
                position: absolute;
                width: 100%;
                height: 0;
                pointer-events: none;
                left: 0;
                top: 0;
                z-index: 1000;
            }
            
            .floating-toolbar {
                pointer-events: auto;
                position: absolute;
                z-index: 1001;
                transform: translate(-50%, 0);
                margin-top: -10px;
                visibility: hidden;
                opacity: 0;
                transition: opacity 0.2s ease, transform 0.2s ease;
                display: flex;
                align-items: center;
                background: var(--toolbar-bg, #000000);
                border-radius: 4px;
                padding: 6px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
            }

            .floating-toolbar.visible {
                visibility: visible;
                opacity: 1;
            }

            .floating-toolbar::after {
                content: '';
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 6px solid var(--toolbar-bg, #000000);
                bottom: -6px;
            }

            .floating-toolbar.below::after {
                border-top: none;
                border-bottom: 6px solid var(--toolbar-bg, #000000);
                bottom: auto;
                top: -6px;
            }

            .floating-toolbar button {
                background: none;
                border: none;
                color: var(--toolbar-text, #ffffff);
                padding: 4px;
                margin: 0 2px;
                cursor: pointer;
                border-radius: 3px;
                transition: background-color 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .floating-toolbar button:hover {
                background-color: var(--toolbar-button-hover, rgba(255, 255, 255, 0.1));
            }

            .floating-toolbar button.active {
                background-color: var(--toolbar-button-active, rgba(255, 255, 255, 0.2));
            }

            .floating-toolbar button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .floating-toolbar .material-icons {
                font-size: 18px;
            }

            .floating-toolbar .divider {
                width: 1px;
                height: 24px;
                background-color: var(--toolbar-divider, rgba(255, 255, 255, 0.2));
                margin: 0 4px;
            }

            .floating-toolbar .toolbar-initial {
                display: flex;
                align-items: center;
            }

            .floating-toolbar .toolbar-group {
                display: flex;
                align-items: center;
                margin: 0 2px;
            }

            .floating-toolbar .toolbar-group:not(:last-child)::after {
                content: '';
                width: 1px;
                height: 24px;
                background-color: var(--toolbar-divider, rgba(255, 255, 255, 0.2));
                margin: 0 4px;
            }

            .floating-toolbar .toolbar-link-input {
                display: none;
                align-items: center;
                padding: 0 4px;
            }

            .floating-toolbar .toolbar-link-input.active {
                display: flex;
            }

            .floating-toolbar .toolbar-link-input input {
                background: none;
                border: none;
                color: var(--toolbar-text, #ffffff);
                outline: none;
                padding: 4px;
                min-width: 200px;
            }

            .floating-toolbar .toolbar-link-input input::placeholder {
                color: var(--toolbar-text, #ffffff);
                opacity: 0.5;
            }
        `
    };

    private static readonly TOOLBAR_STYLES: StyleConfig = {
        id: 'floating-toolbar-styles',
        css: `
            .floating-toolbar {
                --toolbar-bg: #2a2a2a;
                --toolbar-text: #ffffff;
                --toolbar-button-hover: rgba(255, 255, 255, 0.1);
                --toolbar-button-active: rgba(255, 255, 255, 0.2);
                --toolbar-divider: rgba(255, 255, 255, 0.2);
            }

            .floating-toolbar.light {
                --toolbar-bg: #ffffff;
                --toolbar-text: #333333;
                --toolbar-button-hover: rgba(0, 0, 0, 0.05);
                --toolbar-button-active: rgba(0, 0, 0, 0.1);
                --toolbar-divider: rgba(0, 0, 0, 0.1);
            }

            .floating-toolbar.custom {
                --toolbar-bg: var(--custom-toolbar-bg, #2a2a2a);
                --toolbar-text: var(--custom-toolbar-text, #ffffff);
                --toolbar-button-hover: var(--custom-toolbar-button-hover, rgba(255, 255, 255, 0.1));
                --toolbar-button-active: var(--custom-toolbar-button-active, rgba(255, 255, 255, 0.2));
                --toolbar-divider: var(--custom-toolbar-divider, rgba(255, 255, 255, 0.2));
            }
        `
    };

    /**
     * Injects the required base styles for the toolbar.
     */
    public static injectRequiredStyles(): void {
        this.injectStyles(this.REQUIRED_STYLES);
    }

    /**
     * Injects the theme styles for the toolbar.
     */
    public static injectToolbarStyles(): void {
        this.injectStyles(this.TOOLBAR_STYLES);
    }

    /**
     * Removes all injected styles.
     */
    public static cleanup(): void {
        [this.REQUIRED_STYLES.id, this.TOOLBAR_STYLES.id].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.remove();
            }
        });
    }

    /**
     * Injects a style block into the document head.
     * @param config The style configuration to inject
     */
    private static injectStyles(config: StyleConfig): void {
        if (!document.getElementById(config.id)) {
            const style = document.createElement('style');
            style.id = config.id;
            style.textContent = config.css;
            document.head.appendChild(style);
        }
    }
} 