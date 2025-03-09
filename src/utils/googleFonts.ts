interface GoogleFontsConfig {
    families: string[];
    display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
}

export async function loadGoogleFonts(config: GoogleFontsConfig): Promise<void> {
    if (!config.families.length) return;

    // Create a link element for Google Fonts
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    
    // Convert font names to URL format and create the href
    const fontFamilies = config.families
        .map(family => family.replace(/\s+/g, '+'))
        .join('|');
    
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap`;
    
    // Add the link to the document head
    document.head.appendChild(link);

    // Wait for fonts to load
    await document.fonts.ready;
}

export function isGoogleFontLoaded(fontFamily: string): boolean {
    // Create a span with the font family
    const span = document.createElement('span');
    span.style.fontFamily = fontFamily;
    span.textContent = 'Test';
    
    // Add it to the document temporarily
    document.body.appendChild(span);
    
    // Check if the font is loaded
    const isLoaded = document.fonts.check(`12px "${fontFamily}"`);
    
    // Clean up
    document.body.removeChild(span);
    
    return isLoaded;
}

export function getGoogleFontStylesheet(families: string[]): string {
    if (!families.length) return '';
    
    const fontFamilies = families
        .map(family => family.replace(/\s+/g, '+'))
        .join('|');
    
    return `@import url('https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap');`;
} 