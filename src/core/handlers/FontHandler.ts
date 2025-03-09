import { ToolbarConfig, ToolbarState, ToolbarElements } from '../types';
import { loadGoogleFonts, isGoogleFontLoaded } from '../../utils/googleFonts';
import { createFontDropdown, updateFontDropdown } from '../../ui/components/FontDropdown';

interface FontHandlerContext {
    config: ToolbarConfig;
    state: ToolbarState;
    elements: ToolbarElements;
    updateView: () => void;
}

export class FontHandler {
    private context: FontHandlerContext;
    private initialized: boolean = false;

    constructor(context: FontHandlerContext) {
        this.context = context;
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;

        const { config, elements } = this.context;
        if (!config.fontConfig || !elements.toolbar) return;

        // Create font dropdown
        elements.toolbarFontSelect = createFontDropdown(elements.toolbar);

        // Load Google Fonts if configured
        if (config.fontConfig.googleFonts) {
            await loadGoogleFonts(config.fontConfig.googleFonts);
        }

        this.initialized = true;
    }

    handleFontButtonClick = (e: MouseEvent): void => {
        const { elements, state } = this.context;
        if (!elements.toolbarFontSelect) return;

        e.preventDefault();
        e.stopPropagation();

        const isVisible = elements.toolbarFontSelect.style.display !== 'none';

        if (!isVisible) {
            // Update and show dropdown
            updateFontDropdown(this.context, elements.toolbarFontSelect);
            elements.toolbarFontSelect.style.display = 'block';

            // Position the dropdown below the font button
            if (elements.fontButton) {
                const buttonRect = elements.fontButton.getBoundingClientRect();
                elements.toolbarFontSelect.style.top = `${buttonRect.bottom + 4}px`;
                elements.toolbarFontSelect.style.left = `${buttonRect.left}px`;
            }

            // Add click outside listener
            document.addEventListener('click', this.handleClickOutside);
        } else {
            this.hideDropdown();
        }
    };

    private handleClickOutside = (e: MouseEvent): void => {
        const { elements } = this.context;
        if (!elements.toolbarFontSelect) return;

        const target = e.target as Node;
        if (
            !elements.toolbarFontSelect.contains(target) &&
            (!elements.fontButton || !elements.fontButton.contains(target))
        ) {
            this.hideDropdown();
        }
    };

    private hideDropdown(): void {
        const { elements } = this.context;
        if (!elements.toolbarFontSelect) return;

        elements.toolbarFontSelect.style.display = 'none';
        document.removeEventListener('click', this.handleClickOutside);
    }

    cleanup(): void {
        document.removeEventListener('click', this.handleClickOutside);
    }
} 