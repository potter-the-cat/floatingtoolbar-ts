import { test, expect, Page } from '@playwright/test';

test.describe('Font Visual Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the test page
        await page.goto('/examples/floating-toolbar.html');
        
        // Wait for editor to be ready
        await page.waitForSelector('#font-editor .font-content');
    });

    async function selectFirstParagraph(page: Page) {
        await page.evaluate(() => {
            const p = document.querySelector('#font-editor .font-content p');
            if (!p) return;
            
            const range = document.createRange();
            range.selectNodeContents(p);
            
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
        });

        // Wait for toolbar to appear
        await page.waitForSelector('#font-toolbar', { state: 'visible' });
    }

    test('should show font dropdown in correct position', async ({ page }) => {
        await selectFirstParagraph(page);

        // Click the font button
        await page.click('#font-toolbar-font-button');
        
        // Wait for dropdown animation
        await page.waitForTimeout(200);
        
        // Take screenshot of the dropdown
        await expect(page).toHaveScreenshot('font-dropdown-position.png');
    });

    test('should apply system font correctly', async ({ page }) => {
        await selectFirstParagraph(page);

        // Click font button and select Arial
        await page.click('#font-toolbar-font-button');
        await page.click('.toolbar-font-item[style*="font-family: Arial"]');
        
        // Take screenshot of applied font
        await expect(page).toHaveScreenshot('system-font-applied.png');
    });

    test('should apply Google font correctly', async ({ page }) => {
        await selectFirstParagraph(page);

        // Click font button and select Montserrat
        await page.click('#font-toolbar-font-button');
        await page.click('.toolbar-font-item[style*="font-family: Montserrat"]');
        
        // Wait for font to load
        await page.waitForTimeout(500);
        
        // Take screenshot of applied Google font
        await expect(page).toHaveScreenshot('google-font-applied.png');
    });

    test('should handle mixed fonts correctly', async ({ page }) => {
        // Wait for font editor to be in view
        await page.evaluate(() => {
            const fontEditor = document.querySelector('#font-editor');
            if (fontEditor) {
                fontEditor.scrollIntoView();
            }
        });

        // Create text with mixed fonts
        await page.evaluate(() => {
            const p = document.querySelector('#font-editor .font-content p');
            if (!p) return;
            
            p.innerHTML = '<span style="font-family: Arial">Text with Arial</span> <span style="font-family: Times New Roman">Text with Times New Roman</span>';
            
            const range = document.createRange();
            range.selectNodeContents(p);
            
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
        });

        // Wait for toolbar to appear
        await page.waitForSelector('#font-toolbar', { state: 'visible' });

        // Take screenshot of mixed fonts
        await expect(page).toHaveScreenshot('mixed-fonts.png', {
            clip: {
                x: 0,
                y: 0,
                width: 1024,
                height: 768
            }
        });
        
        // Click font button to show dropdown
        await page.click('#font-toolbar-font-button');
        await page.waitForTimeout(200);
        
        // Take screenshot of dropdown with mixed fonts
        await expect(page).toHaveScreenshot('mixed-fonts-dropdown.png', {
            clip: {
                x: 0,
                y: 0,
                width: 1024,
                height: 768
            }
        });
    });

    test('should persist font across multiple selections', async ({ page }) => {
        await selectFirstParagraph(page);

        await page.click('#font-toolbar-font-button');
        await page.click('.toolbar-font-item[style*="font-family: Georgia"]');
        
        // Add and select second paragraph
        await page.evaluate(() => {
            const content = document.querySelector('#font-editor .font-content');
            if (!content) return;
            
            const p2 = document.createElement('p');
            p2.textContent = 'Second paragraph';
            content.appendChild(p2);
            
            const range = document.createRange();
            range.selectNodeContents(p2);
            
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
        });

        // Wait for toolbar to appear
        await page.waitForSelector('#font-toolbar', { state: 'visible' });

        // Take screenshot of font button state with new selection
        await expect(page).toHaveScreenshot('font-persistence.png');
    });

    test('should show scrollable dropdown with many fonts', async ({ page }) => {
        await selectFirstParagraph(page);

        // Reinitialize toolbar with many fonts
        await page.evaluate(() => {
            // @ts-ignore - Accessing window.FloatingToolbar for testing
            window.FloatingToolbar.init({
                container: '#font-editor',
                content: '.font-content',
                mode: 'floating',
                theme: 'light',
                debug: true,
                offset: { x: 0, y: 10 },
                toolbarId: 'font-toolbar',
                buttons: {
                    text: {
                        bold: true,
                        italic: true,
                        underline: true,
                        strikethrough: true
                    },
                    script: {
                        subscript: false,
                        superscript: false
                    },
                    heading: {
                        h1: false,
                        h2: false
                    },
                    special: {
                        code: false,
                        quote: false,
                        dropCap: false,
                        hr: false
                    },
                    list: {
                        bullet: false,
                        number: false
                    },
                    link: {
                        url: false
                    },
                    font: {
                        enabled: true
                    }
                },
                fontConfig: {
                    defaultFonts: [
                        'Arial',
                        'Times New Roman',
                        'Helvetica',
                        'Georgia',
                        'Verdana',
                        'Courier New',
                        'Trebuchet MS',
                        'Impact',
                        'Comic Sans MS',
                        'Palatino',
                        'Garamond',
                        'Bookman',
                        'Tahoma',
                        'Lucida Grande'
                    ],
                    googleFonts: {
                        families: [
                            'Roboto',
                            'Open Sans',
                            'Lato',
                            'Montserrat',
                            'Raleway',
                            'Poppins',
                            'Ubuntu',
                            'Playfair Display',
                            'Merriweather',
                            'Noto Sans',
                            'Source Sans Pro',
                            'Oswald',
                            'Nunito',
                            'Dancing Script'
                        ],
                        display: 'swap'
                    }
                }
            });
        });

        // Wait for toolbar to be reinitialized
        await page.waitForSelector('#font-toolbar', { state: 'hidden' });
        await selectFirstParagraph(page);

        // Click font button
        await page.click('#font-toolbar-font-button');
        
        // Wait for fonts to load and dropdown animation
        await page.waitForTimeout(500);
        
        // Take screenshot of scrollable dropdown showing system fonts
        await expect(page).toHaveScreenshot('scrollable-dropdown-system-fonts.png');

        // Wait for Google fonts to load
        await page.waitForTimeout(1000);

        // Find and scroll to the Google fonts section (using last instance of Roboto since it's in the Google fonts section)
        const googleFont = page.locator('.toolbar-font-item', { hasText: 'Roboto' }).last();
        await googleFont.scrollIntoViewIfNeeded();
        
        // Wait for scroll animation to complete
        await page.waitForTimeout(500);

        // Take screenshot of scrollable dropdown showing Google fonts
        await expect(page).toHaveScreenshot('scrollable-dropdown-google-fonts.png');
    });
}); 