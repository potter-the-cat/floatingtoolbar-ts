/**
 * Base styles for the floating toolbar
 */
export const requiredStyles = `
    /* Theme Variables */
    .floating-toolbar.theme-dark {
        --toolbar-bg: #000000;
        --toolbar-text: #ffffff;
        --toolbar-border: transparent;
        --toolbar-hover: rgba(255, 255, 255, 0.1);
        --toolbar-active: rgba(255, 255, 255, 0.2);
        --toolbar-input-bg: rgba(255, 255, 255, 0.1);
        --toolbar-input-border: rgba(255, 255, 255, 0.2);
        --toolbar-input-focus: rgba(255, 255, 255, 0.4);
        --toolbar-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }

    .floating-toolbar.theme-light {
        --toolbar-bg: #ffffff;
        --toolbar-text: #333333;
        --toolbar-border: #e1e1e1;
        --toolbar-hover: rgba(0, 0, 0, 0.05);
        --toolbar-active: rgba(0, 0, 0, 0.1);
        --toolbar-input-bg: #f5f5f5;
        --toolbar-input-border: #e1e1e1;
        --toolbar-input-focus: #333333;
        --toolbar-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .floating-toolbar.theme-blue {
        --toolbar-bg: #2196F3;
        --toolbar-text: #ffffff;
        --toolbar-border: transparent;
        --toolbar-hover: rgba(255, 255, 255, 0.1);
        --toolbar-active: rgba(255, 255, 255, 0.2);
        --toolbar-input-bg: rgba(255, 255, 255, 0.1);
        --toolbar-input-border: rgba(255, 255, 255, 0.2);
        --toolbar-input-focus: rgba(255, 255, 255, 0.4);
        --toolbar-shadow: 0 2px 6px rgba(33, 150, 243, 0.3);
    }

    .content-wrapper {
        position: relative;
        max-width: 800px;
        margin: 0 auto;
    }

    .toolbar-container {
        height: 40px;
        margin-bottom: 20px;
        position: relative;
        width: 100%;
    }

    .content {
        min-height: 100px;
        outline: none;
    }

    /* Base toolbar styles that use CSS variables */
    .toolbar-container .floating-toolbar {
        background: var(--toolbar-bg, #000000);
        border: 1px solid var(--toolbar-border, transparent);
        border-radius: 4px;
        padding: 6px;
        display: flex;
        gap: 4px;
        box-shadow: var(--toolbar-shadow, 0 2px 6px rgba(0, 0, 0, 0.15));
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        transition: top 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    left 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1000;
        pointer-events: auto;
        width: fit-content;
        min-width: min-content;
        max-width: min(100vw - 40px, 800px);
        will-change: transform, top, left;
        white-space: nowrap;
        box-sizing: border-box;
        flex-wrap: nowrap;
    }


 .toolbar-container .floating-toolbar.following-selection {
                    width: var(--toolbar-width, fit-content) !important;
                    min-width: var(--toolbar-width, min-content) !important;
                    max-width: var(--toolbar-width, min(100vw - 40px, 800px)) !important;
                    flex-wrap: nowrap;
                    flex-shrink: 0;
                }

                .toolbar-container .floating-toolbar:not(.fixed-position):not(.following-selection) {
                    max-width: min(100vw - 40px, 800px);
                }

                .toolbar-container .floating-toolbar button {
                    background: transparent;
                    border: none;
                    color: var(--toolbar-text, #ffffff);
                    padding: 6px;
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 32px;
                    height: 32px;
                    font-size: 14px;
                    pointer-events: auto;
                    user-select: none;
                    -webkit-user-select: none;
                    transition: background-color 0.2s ease;
                }

                .toolbar-container .floating-toolbar button .material-icons {
                    font-size: 20px;
                    color: var(--toolbar-text, #ffffff);
                }

                .toolbar-container .floating-toolbar button:hover {
                    background: var(--toolbar-hover, rgba(255, 255, 255, 0.1));
                }

                .toolbar-container .floating-toolbar button.active {
                    background: var(--toolbar-active, rgba(255, 255, 255, 0.2));
                }

                .toolbar-container .floating-toolbar.fixed-position {
                    white-space: nowrap;
                }

                .toolbar-container .floating-toolbar:not(.fixed-position) {
                    max-width: min(100vw - 40px, 800px);
                }

                .toolbar-container .floating-toolbar .toolbar-initial {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    flex-wrap: nowrap;
                    width: 100%;
                    max-width: 100%;
                    flex-shrink: 0;
                }

                .toolbar-container .floating-toolbar .toolbar-group {
                    display: flex;
                    gap: 4px;
                    flex-wrap: nowrap;
                    flex-shrink: 0;
                }

                .toolbar-container .floating-toolbar:not(.fixed-position) .toolbar-initial {
                    flex-wrap: nowrap;
                }

                /* Link input styles using theme variables */
                .toolbar-container .floating-toolbar .toolbar-link-input {
                    display: none;
                    align-items: center;
                    gap: 4px;
                    padding: 4px;
                    width: fit-content;
                    min-width: min-content;
                    max-width: 100%;
                    flex-wrap: nowrap;
                    box-sizing: border-box;
                    pointer-events: auto;
                }

                .toolbar-container .floating-toolbar .toolbar-link-input.active {
                    display: flex;
                    pointer-events: auto;
                }

                .toolbar-container .floating-toolbar input[type="text"] {
                    background: var(--toolbar-input-bg, rgba(255, 255, 255, 0.1));
                    border: 1px solid var(--toolbar-input-border, rgba(255, 255, 255, 0.2));
                    border-radius: 4px;
                    color: var(--toolbar-text, #ffffff);
                    padding: 4px 8px;
                    font-size: 14px;
                    width: 250px;
                    min-width: 200px;
                    max-width: 250px;
                    flex: 1;
                    box-sizing: border-box;
                    pointer-events: auto !important;
                    cursor: text !important;
                }

                .toolbar-container .floating-toolbar input[type="text"]:focus {
                    outline: none;
                    border-color: var(--toolbar-input-focus, rgba(255, 255, 255, 0.4));
                }

                .toolbar-container .floating-toolbar input[type="text"]::placeholder {
                    color: var(--toolbar-text, #ffffff);
                    opacity: 0.6;
                }

                .toolbar-container .floating-toolbar .toolbar-link-input button {
                    flex-shrink: 0;
                    min-width: 32px;
                    width: 32px;
                    padding: 4px;
                    box-sizing: border-box;
                }

                .toolbar-container .floating-toolbar.following-selection .toolbar-link-input {
                    width: auto;
                    min-width: auto;
                    max-width: 100%;
                }

                .toolbar-container .floating-toolbar.following-selection {
                    width: auto !important;
                    min-width: fit-content !important;
                    max-width: min(100vw - 40px, 800px) !important;
                }

                /* Chevron styles using CSS variables */
                .toolbar-container .floating-toolbar::after {
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
                    transition: top 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                                bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    will-change: top, bottom;
                }

                .toolbar-container .floating-toolbar.below::after {
                    border-top: none;
                    border-bottom: 6px solid var(--toolbar-bg, #000000);
                    bottom: auto;
                    top: -6px;
                }

`;
/**
 * Add required styles to the document
 */
export function addRequiredStyles() {
    const styleId = 'floating-toolbar-required-styles';
    // Check if styles are already added
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = requiredStyles;
        document.head.appendChild(style);
    }
}
//# sourceMappingURL=styles.js.map