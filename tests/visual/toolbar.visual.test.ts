import { test, expect } from '@playwright/test';

test.describe('Floating Toolbar Visual Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');  // Adjust port as needed
        // Wait for the page to be fully loaded and initialized
        await page.waitForSelector('.editable-content', { state: 'visible' });
        await page.waitForSelector('.light-content', { state: 'visible' });
        await page.waitForSelector('.themed-content', { state: 'visible' });
    });

    test('Dark theme toolbar appears correctly on text selection', async ({ page }) => {
        // Get the editable content
        const editor = await page.locator('.editable-content');
        
        // Wait for editor to be ready
        await editor.waitFor({ state: 'visible' });
        
        // Select some text
        await editor.evaluate((el) => {
            // Create a range and select the first paragraph
            const range = document.createRange();
            const firstParagraph = el.querySelector('p');
            if (!firstParagraph) return;
            
            range.selectNodeContents(firstParagraph);
            const selection = window.getSelection()!;
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Create and dispatch mouseup event
            const mouseupEvent = new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: firstParagraph.getBoundingClientRect().left + 10,
                clientY: firstParagraph.getBoundingClientRect().top + 10
            });
            firstParagraph.dispatchEvent(mouseupEvent);
            
            // Create and dispatch selectionchange event
            const selectionchangeEvent = new Event('selectionchange', {
                bubbles: true
            });
            document.dispatchEvent(selectionchangeEvent);
        });

        // Wait for toolbar to appear
        const toolbar = await page.locator('#default-toolbar');
        await expect(toolbar).toBeVisible({ timeout: 10000 });
        await expect(toolbar).toHaveClass(/theme-dark/);
        await expect(toolbar).toHaveClass(/visible/);

        // Take a screenshot of the toolbar
        await expect(toolbar).toHaveScreenshot('dark-theme-toolbar.png');
    });

    test('Light theme toolbar has correct styling', async ({ page }) => {
        const editor = await page.locator('.light-content');
        
        // Wait for editor to be ready
        await editor.waitFor({ state: 'visible' });
        
        // Select some text
        await editor.evaluate((el) => {
            // Create a range and select the first paragraph
            const range = document.createRange();
            const firstParagraph = el.querySelector('p');
            if (!firstParagraph) return;
            
            range.selectNodeContents(firstParagraph);
            const selection = window.getSelection()!;
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Create and dispatch mouseup event
            const mouseupEvent = new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: firstParagraph.getBoundingClientRect().left + 10,
                clientY: firstParagraph.getBoundingClientRect().top + 10
            });
            firstParagraph.dispatchEvent(mouseupEvent);
            
            // Create and dispatch selectionchange event
            const selectionchangeEvent = new Event('selectionchange', {
                bubbles: true
            });
            document.dispatchEvent(selectionchangeEvent);
        });

        const toolbar = await page.locator('#light-toolbar');
        await expect(toolbar).toBeVisible({ timeout: 10000 });
        await expect(toolbar).toHaveClass(/theme-light/);
        await expect(toolbar).toHaveClass(/visible/);
        
        // Wait for styles to be fully applied
        await page.waitForTimeout(100); // Give styles time to be applied
        
        // Verify light theme specific styles
        await expect(toolbar).toHaveCSS('background-color', 'rgb(255, 255, 255)'); // White background
        await expect(toolbar).toHaveCSS('color', 'rgb(51, 51, 51)'); // Dark text
        // Box shadow can be formatted differently by browsers but represents the same value
        const boxShadow = await toolbar.evaluate(el => window.getComputedStyle(el).boxShadow);
        expect(boxShadow).toMatch(/rgba\(0,\s*0,\s*0,\s*0\.1\)/);
        expect(boxShadow).toMatch(/2px/);
        expect(boxShadow).toMatch(/6px/);
        await expect(toolbar).toHaveCSS('border', '1px solid rgb(225, 225, 225)');
        
        await expect(toolbar).toHaveScreenshot('light-theme-toolbar.png');
    });

    test('Custom theme toolbar matches design', async ({ page }) => {
        const editor = await page.locator('.themed-content');
        
        // Wait for editor to be ready
        await editor.waitFor({ state: 'visible' });
        
        // Select some text
        await editor.evaluate((el) => {
            // Create a range and select the first paragraph
            const range = document.createRange();
            const firstParagraph = el.querySelector('p');
            if (!firstParagraph) return;
            
            range.selectNodeContents(firstParagraph);
            const selection = window.getSelection()!;
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Create and dispatch mouseup event
            const mouseupEvent = new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: firstParagraph.getBoundingClientRect().left + 10,
                clientY: firstParagraph.getBoundingClientRect().top + 10
            });
            firstParagraph.dispatchEvent(mouseupEvent);
            
            // Create and dispatch selectionchange event
            const selectionchangeEvent = new Event('selectionchange', {
                bubbles: true
            });
            document.dispatchEvent(selectionchangeEvent);
        });

        const toolbar = await page.locator('#themed-toolbar');
        await expect(toolbar).toBeVisible({ timeout: 10000 });
        await expect(toolbar).toHaveClass(/theme-custom/);
        await expect(toolbar).toHaveClass(/visible/);
        await expect(toolbar).toHaveScreenshot('custom-theme-toolbar.png');
    });

    test('Toolbar groups are properly spaced', async ({ page }) => {
        const editor = await page.locator('.editable-content');
        
        // Wait for editor to be ready
        await editor.waitFor({ state: 'visible' });
        
        // Select some text
        await editor.evaluate((el) => {
            // Create a range and select the first paragraph
            const range = document.createRange();
            const firstParagraph = el.querySelector('p');
            if (!firstParagraph) return;
            
            range.selectNodeContents(firstParagraph);
            const selection = window.getSelection()!;
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Create and dispatch mouseup event
            const mouseupEvent = new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: firstParagraph.getBoundingClientRect().left + 10,
                clientY: firstParagraph.getBoundingClientRect().top + 10
            });
            firstParagraph.dispatchEvent(mouseupEvent);
            
            // Create and dispatch selectionchange event
            const selectionchangeEvent = new Event('selectionchange', {
                bubbles: true
            });
            document.dispatchEvent(selectionchangeEvent);
        });

        const toolbar = await page.locator('#default-toolbar');
        await expect(toolbar).toBeVisible({ timeout: 10000 });
        await expect(toolbar).toHaveClass(/visible/);
        
        // Wait for styles to be fully applied
        await page.waitForTimeout(100); // Give styles time to be applied
        
        // Check spacing between groups
        const groups = await toolbar.locator('.toolbar-group').all();
        for (let i = 0; i < groups.length - 1; i++) {
            const group1Bounds = await groups[i].boundingBox();
            const group2Bounds = await groups[i + 1].boundingBox();
            const spacing = group2Bounds!.x - (group1Bounds!.x + group1Bounds!.width);
            // Account for the divider width (1px) and margins (4px on each side)
            expect(spacing).toBeGreaterThanOrEqual(9); // 1px divider + 8px total margin
        }
    });

    test('Link input appears correctly', async ({ page }) => {
        const editor = await page.locator('.editable-content');
        
        // Wait for editor to be ready
        await editor.waitFor({ state: 'visible' });
        
        // Select some text
        await editor.evaluate((el) => {
            // Create a range and select the first paragraph
            const range = document.createRange();
            const firstParagraph = el.querySelector('p');
            if (!firstParagraph) return;
            
            range.selectNodeContents(firstParagraph);
            const selection = window.getSelection()!;
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Create and dispatch mouseup event
            const mouseupEvent = new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: firstParagraph.getBoundingClientRect().left + 10,
                clientY: firstParagraph.getBoundingClientRect().top + 10
            });
            firstParagraph.dispatchEvent(mouseupEvent);
            
            // Create and dispatch selectionchange event
            const selectionchangeEvent = new Event('selectionchange', {
                bubbles: true
            });
            document.dispatchEvent(selectionchangeEvent);
        });

        const toolbar = await page.locator('#default-toolbar');
        await expect(toolbar).toBeVisible({ timeout: 10000 });
        await expect(toolbar).toHaveClass(/visible/);

        // Wait for styles to be fully applied
        await page.waitForTimeout(100);

        // Wait for link button to be ready and click it
        const linkButton = await page.locator('#default-toolbar-link-button');
        await expect(linkButton).toBeVisible();
        await linkButton.click();
        
        // Wait for link input to appear and become active
        await page.waitForTimeout(100); // Give time for the state change
        
        // Use more specific selector within the current toolbar
        const linkInput = await toolbar.locator('.toolbar-link-input');
        await expect(linkInput).toBeVisible({ timeout: 10000 });
        await expect(linkInput).toHaveClass(/active/);

        // Verify the input field is focused and interactive
        const inputField = await linkInput.locator('input');
        await expect(inputField).toBeFocused();
        await expect(inputField).toBeEnabled();
        
        await expect(toolbar).toHaveScreenshot('link-input-view.png');
    });
}); 