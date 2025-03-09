import { ToolbarConfig, ToolbarState, ToolbarElements } from '../../core/types';

interface FontDropdownContext {
    config: ToolbarConfig;
    state: ToolbarState;
    elements: ToolbarElements;
    updateView: () => void;
}

export function createFontDropdown(container: HTMLElement): HTMLElement {
    const dropdown = document.createElement('div');
    dropdown.className = 'floating-toolbar-font-dropdown';
    dropdown.style.display = 'none';
    container.appendChild(dropdown);
    return dropdown;
}

export function updateFontDropdown(
    context: FontDropdownContext,
    dropdown: HTMLElement
): void {
    const { config, state } = context;
    if (!config.fontConfig) return;

    // Clear existing content
    dropdown.innerHTML = '';

    // Create default fonts section
    const defaultFontsSection = document.createElement('div');
    defaultFontsSection.className = 'floating-toolbar-font-section';
    
    const defaultFontsTitle = document.createElement('div');
    defaultFontsTitle.className = 'floating-toolbar-font-section-title';
    defaultFontsTitle.textContent = 'System Fonts';
    defaultFontsSection.appendChild(defaultFontsTitle);

    config.fontConfig.defaultFonts.forEach(font => {
        const fontItem = createFontItem(font, context);
        defaultFontsSection.appendChild(fontItem);
    });

    dropdown.appendChild(defaultFontsSection);

    // Create Google Fonts section if configured
    if (config.fontConfig.googleFonts?.families.length) {
        const googleFontsSection = document.createElement('div');
        googleFontsSection.className = 'floating-toolbar-font-section';
        
        const googleFontsTitle = document.createElement('div');
        googleFontsTitle.className = 'floating-toolbar-font-section-title';
        googleFontsTitle.textContent = 'Google Fonts';
        googleFontsSection.appendChild(googleFontsTitle);

        config.fontConfig.googleFonts.families.forEach(font => {
            const fontItem = createFontItem(font, context);
            googleFontsSection.appendChild(fontItem);
        });

        dropdown.appendChild(googleFontsSection);
    }
}

function createFontItem(
    fontName: string,
    context: FontDropdownContext
): HTMLElement {
    const { state } = context;
    const item = document.createElement('div');
    item.className = 'floating-toolbar-font-item';
    if (state.currentFont === fontName) {
        item.classList.add('active');
    }

    // Preview text with the actual font
    item.style.fontFamily = fontName;
    item.textContent = fontName;

    item.addEventListener('click', () => {
        handleFontSelection(fontName, context);
    });

    return item;
}

function handleFontSelection(
    fontName: string,
    context: FontDropdownContext
): void {
    const { state, elements } = context;
    
    if (!state.selectionRange) return;

    // Update the font of the selected text
    const span = document.createElement('span');
    span.style.fontFamily = fontName;
    
    state.selectionRange.surroundContents(span);
    state.currentFont = fontName;

    // Update UI
    if (elements.fontButton) {
        elements.fontButton.style.fontFamily = fontName;
    }

    // Close the dropdown
    if (elements.toolbarFontSelect) {
        elements.toolbarFontSelect.style.display = 'none';
    }

    // Reset view
    context.updateView();
} 