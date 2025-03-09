import { test, expect, Page } from '@playwright/test';

test.describe('Text Alignment Visual Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the test page
        await page.goto('http://localhost:3000/examples/floating-toolbar.html');
        
        // Wait for the editor to be ready
        await page.waitForSelector('.editable-content', { state: 'visible' });

        // Set up test content with a long paragraph to show alignment effects
        await page.evaluate(() => {
            const content = document.querySelector('.editable-content');
            if (content) {
                content.innerHTML = `
                    <p>This is a long paragraph that will demonstrate the visual effects of different text alignment options. 
                    Text alignment is an important aspect of typography and document design. It affects readability, aesthetics, 
                    and the overall visual hierarchy of your content. The floating toolbar provides four alignment options: 
                    left alignment (the default in most Western languages), center alignment, right alignment, and justified alignment.</p>
                `;
            }
        });
    });

    // Helper function to select all text in the editor
    const selectAllText = async (page: Page) => {
        await page.evaluate(() => {
            const content = document.querySelector('.editable-content');
            if (!content) return;
            
            const range = document.createRange();
            range.selectNodeContents(content);
            
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);

            // Trigger events
            content.dispatchEvent(new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
                view: window
            }));
            document.dispatchEvent(new Event('selectionchange', { bubbles: true }));
        });

        // Wait for toolbar to appear
        await page.waitForSelector('#default-toolbar', { state: 'visible' });
        await page.waitForTimeout(100);
    };

    test('toolbar shows alignment buttons with correct icons', async ({ page }) => {
        // Select all text to make the toolbar appear
        await selectAllText(page);
        
        // Wait for toolbar to be visible
        await page.waitForSelector('#default-toolbar', { state: 'visible' });
        
        // Take a screenshot of the toolbar focusing on alignment buttons
        const toolbar = await page.locator('#default-toolbar');
        await expect(toolbar).toBeVisible();
        
        // Take a screenshot of the toolbar
        await toolbar.screenshot({ 
            path: 'playwright/tests/visual/alignment.visual.test.ts-snapshots/alignment-buttons-toolbar.png'
        });
        
        // Check that alignment buttons have the correct icons
        const alignLeftIcon = await page.locator('#default-toolbar-align-left-button .material-icons');
        const alignCenterIcon = await page.locator('#default-toolbar-align-center-button .material-icons');
        const alignRightIcon = await page.locator('#default-toolbar-align-right-button .material-icons');
        const alignJustifyIcon = await page.locator('#default-toolbar-align-justify-button .material-icons');
        
        await expect(alignLeftIcon).toHaveAttribute('data-icon', 'format_align_left');
        await expect(alignCenterIcon).toHaveAttribute('data-icon', 'format_align_center');
        await expect(alignRightIcon).toHaveAttribute('data-icon', 'format_align_right');
        await expect(alignJustifyIcon).toHaveAttribute('data-icon', 'format_align_justify');
    });

    test('visual appearance of left-aligned text', async ({ page }) => {
        // Select all text
        await selectAllText(page);
        
        // Click the left align button
        await page.click('#default-toolbar-align-left-button');
        await page.waitForTimeout(100);
        
        // Verify the alignment was applied (for debugging purposes)
        const alignment = await page.evaluate(() => {
            const p = document.querySelector('.editable-content p');
            if (p) {
                return window.getComputedStyle(p).textAlign;
            }
            return null;
        });
        
        // 'start' is equivalent to 'left' in many browsers
        expect(['left', 'start']).toContain(alignment);
        
        // Take a screenshot of the left-aligned text
        const content = await page.locator('.editable-content');
        await content.screenshot({ 
            path: 'playwright/tests/visual/alignment.visual.test.ts-snapshots/left-aligned-visual.png'
        });
    });

    test('visual appearance of center-aligned text', async ({ page }) => {
        // Select all text
        await selectAllText(page);
        
        // Click the center align button
        await page.click('#default-toolbar-align-center-button');
        await page.waitForTimeout(100);
        
        // Take a screenshot of the center-aligned text
        const content = await page.locator('.editable-content');
        await content.screenshot({ 
            path: 'playwright/tests/visual/alignment.visual.test.ts-snapshots/center-aligned-visual.png'
        });
    });

    test('visual appearance of right-aligned text', async ({ page }) => {
        // Select all text
        await selectAllText(page);
        
        // Click the right align button
        await page.click('#default-toolbar-align-right-button');
        await page.waitForTimeout(100);
        
        // Take a screenshot of the right-aligned text
        const content = await page.locator('.editable-content');
        await content.screenshot({ 
            path: 'playwright/tests/visual/alignment.visual.test.ts-snapshots/right-aligned-visual.png'
        });
    });

    test('visual appearance of justified text', async ({ page }) => {
        // Select all text
        await selectAllText(page);
        
        // Click the justify align button
        await page.click('#default-toolbar-align-justify-button');
        await page.waitForTimeout(100);
        
        // Take a screenshot of the justified text
        const content = await page.locator('.editable-content');
        await content.screenshot({ 
            path: 'playwright/tests/visual/alignment.visual.test.ts-snapshots/justified-visual.png'
        });
    });

    test('active state of alignment buttons', async ({ page }) => {
        // Select all text
        await selectAllText(page);
        
        // Test each alignment button's active state
        const alignments = [
            { name: 'left', selector: '#default-toolbar-align-left-button' },
            { name: 'center', selector: '#default-toolbar-align-center-button' },
            { name: 'right', selector: '#default-toolbar-align-right-button' },
            { name: 'justify', selector: '#default-toolbar-align-justify-button' }
        ];
        
        for (const alignment of alignments) {
            // Click the alignment button
            await page.click(alignment.selector);
            await page.waitForTimeout(100);
            
            // Take a screenshot of the toolbar showing the active state
            const toolbar = await page.locator('#default-toolbar');
            await toolbar.screenshot({ 
                path: `playwright/tests/visual/alignment.visual.test.ts-snapshots/${alignment.name}-active-state.png`
            });
            
            // Verify the button has the active class
            const button = await page.locator(alignment.selector);
            const hasActiveClass = await button.evaluate(el => el.classList.contains('active'));
            expect(hasActiveClass).toBe(true);
        }
    });

    test('alignment buttons in different themes', async ({ page }) => {
        // Test in light theme
        await page.goto('http://localhost:3000/examples/floating-toolbar.html');
        await page.waitForSelector('.light-content', { state: 'visible' });
        
        // Set up content in light theme editor
        await page.evaluate(() => {
            const content = document.querySelector('.light-content');
            if (content) {
                content.innerHTML = '<p>This is text in the light theme editor.</p>';
            }
        });
        
        // Select text in light theme
        await page.evaluate(() => {
            const content = document.querySelector('.light-content');
            if (!content) return;
            
            const range = document.createRange();
            range.selectNodeContents(content);
            
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
            
            content.dispatchEvent(new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
                view: window
            }));
        });
        
        // Wait for light theme toolbar
        await page.waitForSelector('#light-toolbar', { state: 'visible' });
        
        // Take screenshot of light theme toolbar
        const lightToolbar = await page.locator('#light-toolbar');
        await lightToolbar.screenshot({ 
            path: 'playwright/tests/visual/alignment.visual.test.ts-snapshots/light-theme-alignment-buttons.png'
        });
        
        // Test in custom theme
        await page.evaluate(() => {
            const content = document.querySelector('.themed-content');
            if (content) {
                content.innerHTML = '<p>This is text in the custom theme editor.</p>';
            }
        });
        
        // Select text in custom theme
        await page.evaluate(() => {
            const content = document.querySelector('.themed-content');
            if (!content) return;
            
            const range = document.createRange();
            range.selectNodeContents(content);
            
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
            
            content.dispatchEvent(new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
                view: window
            }));
        });
        
        // Wait for custom theme toolbar
        await page.waitForSelector('#themed-toolbar', { state: 'visible' });
        
        // Take screenshot of custom theme toolbar
        const themedToolbar = await page.locator('#themed-toolbar');
        await themedToolbar.screenshot({ 
            path: 'playwright/tests/visual/alignment.visual.test.ts-snapshots/custom-theme-alignment-buttons.png'
        });
    });
}); 