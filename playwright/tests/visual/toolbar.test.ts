import { test, expect, Page } from '@playwright/test';

async function selectText(page: Page, text: string): Promise<void> {
    await page.evaluate((textToSelect) => {
        const content = document.querySelector('.content');
        if (!content) return;
        
        const walker = document.createTreeWalker(
            content,
            NodeFilter.SHOW_TEXT,
            null
        );

        let node;
        while (node = walker.nextNode()) {
            if (node.textContent?.includes(textToSelect)) {
                const range = document.createRange();
                range.selectNodeContents(node);
                const selection = window.getSelection()!;
                selection.removeAllRanges();
                selection.addRange(range);
                
                const mouseupEvent = new MouseEvent('mouseup', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                node.parentElement?.dispatchEvent(mouseupEvent);
                document.dispatchEvent(new Event('selectionchange', { bubbles: true }));
                break;
            }
        }
    }, text);

    // Wait for toolbar animation to complete (300ms transition + buffer)
    await page.waitForTimeout(500);
    
    // Ensure toolbar is visible and in the correct state
    const toolbar = await page.locator('#persistent-toolbar');
    await expect(toolbar).toBeVisible();
    await expect(toolbar).toHaveClass(/following-selection/);
}

async function createLink(page: Page, text: string, url: string): Promise<void> {
    // First select the text
    await selectText(page, text);
    
    // Wait for toolbar to be visible and in correct state
    const toolbar = await page.locator('#persistent-toolbar');
    await expect(toolbar).toBeVisible();
    await expect(toolbar).toHaveClass(/following-selection/);
    
    // Click the link button and wait for it to be visible
    const linkButton = await toolbar.locator('button[title="Add Link"]');
    await expect(linkButton).toBeVisible({ timeout: 5000 });
    await linkButton.click();
    
    // Wait for link input to appear
    const linkInput = await toolbar.locator('#persistent-toolbar-link-input');
    await expect(linkInput).toBeVisible({ timeout: 5000 });
    await linkInput.fill(url);
    
    // Press Enter to confirm
    await linkInput.press('Enter');
    
    // Wait for toolbar to update
    await page.waitForTimeout(500);
}

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

    test('Link validation shows/hides visit button appropriately', async ({ page }) => {
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

        // Get initial position and container width
        const initialPosition = await toolbar.boundingBox();
        const contentWrapper = await toolbar.evaluate(el => {
            const wrapper = el.closest('.content-wrapper');
            return wrapper ? wrapper.getAttribute('id') || `.content-wrapper:has(#${el.id})` : null;
        });
        const wrapperBox = contentWrapper ? await page.locator(contentWrapper).boundingBox() : null;
        
        if (!initialPosition || !wrapperBox) {
            throw new Error('Could not get initial positions');
        }

        // Calculate initial center offset
        const initialCenterOffset = initialPosition.x + (initialPosition.width / 2) - (wrapperBox.x + (wrapperBox.width / 2));

        // Click the link button to show link input
        const linkButton = await page.locator('#default-toolbar-link-button');
        await expect(linkButton).toBeVisible();
        await linkButton.click();
        
        // Wait for link input to appear and animation to complete
        await page.waitForTimeout(300);
        
        // Get the input field and visit button
        const inputField = await toolbar.locator('.toolbar-link-input input');
        const visitButton = await toolbar.locator('#default-toolbar-visit-link');
        
        // Test invalid URL
        await inputField.fill('g');
        await page.waitForTimeout(300); // Wait longer for validation
        await expect(visitButton).toHaveCSS('display', 'none');

        // Verify toolbar remains reasonably centered
        const positionAfterInvalid = await toolbar.boundingBox();
        if (!positionAfterInvalid) throw new Error('Could not get toolbar position after invalid URL');
        
        const centerOffsetAfterInvalid = positionAfterInvalid.x + (positionAfterInvalid.width / 2) - (wrapperBox.x + (wrapperBox.width / 2));
        const maxOffset = Math.min(50, wrapperBox.width * 0.1); // Allow up to 50px or 10% of wrapper width
        expect(Math.abs(centerOffsetAfterInvalid)).toBeLessThan(maxOffset);
        expect(Math.abs(positionAfterInvalid.y - initialPosition.y)).toBeLessThan(2); // Vertical position should remain stable

        await expect(toolbar).toHaveScreenshot('link-input-invalid-url.png');
        
        // Test partial URL
        await inputField.fill('example');
        await page.waitForTimeout(300); // Wait longer for validation
        await expect(visitButton).toHaveCSS('display', 'none');
        
        // Test valid URL
        await inputField.fill('https://example.com');
        await page.waitForTimeout(300); // Wait longer for validation
        await expect(visitButton).toHaveCSS('display', 'flex');

        // Verify toolbar remains reasonably centered
        const positionAfterValid = await toolbar.boundingBox();
        if (!positionAfterValid) throw new Error('Could not get toolbar position after valid URL');
        
        const centerOffsetAfterValid = positionAfterValid.x + (positionAfterValid.width / 2) - (wrapperBox.x + (wrapperBox.width / 2));
        expect(Math.abs(centerOffsetAfterValid)).toBeLessThan(maxOffset);
        expect(Math.abs(positionAfterValid.y - initialPosition.y)).toBeLessThan(2); // Vertical position should remain stable

        // Wait for any animations to complete
        await page.waitForTimeout(100);
        await expect(toolbar).toHaveScreenshot('link-input-valid-url.png');
    });

    test('Toolbar switches position when scrolling', async ({ page }) => {
        // First, we need to inject some tall content to enable scrolling
        await page.evaluate(() => {
            const content = document.querySelector('.editable-content') as HTMLElement;
            if (content) {
                // Add a spacer at the top to ensure consistent positioning
                const topSpacer = document.createElement('div');
                topSpacer.style.height = '200px';
                content.insertBefore(topSpacer, content.firstChild);

                // Add enough paragraphs to make the page scrollable
                for (let i = 0; i < 50; i++) {
                    const p = document.createElement('p');
                    p.textContent = `Paragraph ${i + 1} - Lorem ipsum dolor sit amet, consectetur adipiscing elit. `.repeat(3);
                    content.appendChild(p);
                }
                // Ensure the content area is tall enough
                content.style.minHeight = '2000px';
            }
        });

        const editor = await page.locator('.editable-content');
        await editor.waitFor({ state: 'visible' });

        // Scroll to top first to ensure consistent starting position
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(100);

        // Select text in the first paragraph (after the spacer)
        await editor.evaluate((el) => {
            const range = document.createRange();
            const paragraphs = el.querySelectorAll('p');
            const firstParagraph = paragraphs[0];
            if (!firstParagraph) return;
            
            range.selectNodeContents(firstParagraph);
            const selection = window.getSelection()!;
            selection.removeAllRanges();
            selection.addRange(range);
            
            const mouseupEvent = new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: firstParagraph.getBoundingClientRect().left + 10,
                clientY: firstParagraph.getBoundingClientRect().top + 10
            });
            firstParagraph.dispatchEvent(mouseupEvent);
            
            const selectionchangeEvent = new Event('selectionchange', {
                bubbles: true
            });
            document.dispatchEvent(selectionchangeEvent);
        });

        // Wait for toolbar to appear above text
        const toolbar = await page.locator('#default-toolbar');
        await expect(toolbar).toBeVisible({ timeout: 10000 });
        
        // Wait for initial positioning to settle
        await page.waitForTimeout(500);
        
        // Take screenshot of initial position (showing full viewport)
        await page.screenshot({ path: 'playwright/tests/visual/toolbar.test.ts-snapshots/full-page-before-scroll.png' });
        
        // Get the selection's position before scrolling
        const initialSelectionPos = await page.evaluate(() => {
            const selection = window.getSelection();
            if (!selection || !selection.rangeCount) return null;
            const range = selection.getRangeAt(0);
            return range.getBoundingClientRect().top;
        });
        
        if (!initialSelectionPos) throw new Error('Could not get selection position');
        
        // Scroll down until the selection is near the top of the viewport
        await page.evaluate(async () => {
            const selection = window.getSelection();
            if (!selection || !selection.rangeCount) return;
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const scrollAmount = window.pageYOffset + rect.top - 50; // Leave 50px at top
            
            window.scrollTo({
                top: scrollAmount,
                behavior: 'instant'
            });
        });
        
        // Wait for position change animation
        await page.waitForTimeout(500);
        
        // Take screenshot of final position (showing full viewport)
        await page.screenshot({ path: 'playwright/tests/visual/toolbar.test.ts-snapshots/full-page-after-scroll.png' });
        
        // Get the selection's position after scrolling
        const finalSelectionPos = await page.evaluate(() => {
            const selection = window.getSelection();
            if (!selection || !selection.rangeCount) return null;
            const range = selection.getRangeAt(0);
            return range.getBoundingClientRect().top;
        });
        
        if (!finalSelectionPos) throw new Error('Could not get final selection position');
        
        // Verify the selection has moved up in the viewport
        expect(finalSelectionPos).toBeLessThan(initialSelectionPos);
        
        // Verify the toolbar has the correct classes
        await expect(toolbar).toHaveClass(/following-selection/);
        await expect(toolbar).not.toHaveClass(/fixed-position/);
    });

    test('Link toolbar maintains position when editing new link', async ({ page }) => {
        const editor = await page.locator('.editable-content');
        await editor.waitFor({ state: 'visible' });
        
        // Select text in the middle of the content
        await editor.evaluate((el) => {
            const range = document.createRange();
            const paragraphs = el.querySelectorAll('p');
            const middleParagraph = paragraphs[Math.floor(paragraphs.length / 2)];
            if (!middleParagraph) return;
            
            range.selectNodeContents(middleParagraph);
            const selection = window.getSelection()!;
            selection.removeAllRanges();
            selection.addRange(range);
            
            const mouseupEvent = new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            middleParagraph.dispatchEvent(mouseupEvent);
            document.dispatchEvent(new Event('selectionchange', { bubbles: true }));
        });

        const toolbar = await page.locator('#default-toolbar');
        await expect(toolbar).toBeVisible();
        
        // Get initial toolbar position and state
        const initialPosition = await toolbar.boundingBox();
        if (!initialPosition) throw new Error('Could not get toolbar position');

        // Store initial classes
        const initialClasses = await toolbar.evaluate(el => Array.from(el.classList));

        // Click link button
        const linkButton = await toolbar.locator('button[title="Add Link"]');
        await linkButton.click();
        
        // Wait for animation
        await page.waitForTimeout(100);

        // Verify toolbar state and classes are maintained
        await expect(toolbar).toBeVisible();
        for (const className of initialClasses) {
            await expect(toolbar).toHaveClass(new RegExp(className));
        }
        
        // Take screenshot
        await expect(toolbar).toHaveScreenshot('link-toolbar-position-maintained.png');
    });

    test('Link toolbar moves to selection when editing existing link', async ({ page }) => {
        const editor = await page.locator('.editable-content');
        await editor.waitFor({ state: 'visible' });
        
        // First create a link
        await editor.evaluate(() => {
            const p = document.createElement('p');
            const a = document.createElement('a');
            a.href = 'https://example.com';
            a.textContent = 'Example Link';
            p.appendChild(a);
            p.appendChild(document.createTextNode(' Some text after the link.'));
            document.querySelector('.editable-content')?.appendChild(p);
        });

        // Wait for the link to be added
        await page.waitForTimeout(100);

        // Select the link text
        await editor.evaluate(() => {
            const link = document.querySelector('.editable-content a');
            if (!link) return;
            
            const range = document.createRange();
            range.selectNodeContents(link);
            const selection = window.getSelection()!;
            selection.removeAllRanges();
            selection.addRange(range);
            
            const mouseupEvent = new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            link.dispatchEvent(mouseupEvent);
            document.dispatchEvent(new Event('selectionchange', { bubbles: true }));
        });

        const toolbar = await page.locator('#default-toolbar');
        await expect(toolbar).toBeVisible();

        // Get the link's position
        const linkPosition = await editor.evaluate(() => {
            const link = document.querySelector('.editable-content a');
            return link?.getBoundingClientRect();
        });

        if (!linkPosition) throw new Error('Could not get link position');

        // Get toolbar position
        const toolbarPosition = await toolbar.boundingBox();
        if (!toolbarPosition) throw new Error('Could not get toolbar position');

        // Verify toolbar is in a reasonable position relative to the link
        const verticalDistance = Math.min(
            Math.abs(toolbarPosition.y + toolbarPosition.height - linkPosition.top),
            Math.abs(toolbarPosition.y - linkPosition.bottom)
        );
        const verticalTolerance = 100; // Allow reasonable vertical variation
        expect(verticalDistance).toBeLessThanOrEqual(verticalTolerance);

        // Verify horizontal alignment
        const linkCenter = linkPosition.left + (linkPosition.width / 2);
        const toolbarCenter = toolbarPosition.x + (toolbarPosition.width / 2);
        const horizontalTolerance = 150; // Allow reasonable horizontal variation
        expect(Math.abs(toolbarCenter - linkCenter)).toBeLessThanOrEqual(horizontalTolerance);
        
        // Verify toolbar has correct classes
        await expect(toolbar).toHaveClass(/following-selection/);
        await expect(toolbar).not.toHaveClass(/fixed-position/);
        
        // Take screenshot
        await expect(toolbar).toHaveScreenshot('link-toolbar-at-selection.png');
    });

    test('Persistent toolbar maintains position when editing new link', async ({ page }) => {
        // Navigate to persistent toolbar example
        await page.goto('http://localhost:3000/examples/persistent-toolbar.html');
        await page.waitForSelector('.content', { state: 'visible' });
        
        // Initially should be persistent at top
        const toolbar = await page.locator('#persistent-toolbar');
        await expect(toolbar).toBeVisible();
        await expect(toolbar).toHaveClass(/persistent-position/);
        
        // Take screenshot of initial state
        await page.screenshot({ path: 'playwright/tests/visual/toolbar.test.ts-snapshots/persistent-toolbar-initial.png' });

        // Select some text
        await selectText(page, 'Lorem ipsum');
        
        // Take screenshot after selection
        await page.screenshot({ path: 'playwright/tests/visual/toolbar.test.ts-snapshots/persistent-toolbar-after-selection.png' });

        // Click link button
        const linkButton = await toolbar.locator('button[title="Add Link"]');
        await linkButton.click();
        
        // Wait for animation
        await page.waitForTimeout(500);

        // Should maintain position at selection during link editing
        await expect(toolbar).toHaveClass(/following-selection/);
        await expect(toolbar).not.toHaveClass(/persistent-position/);
        
        // Take screenshot of link editing state
        await page.screenshot({ path: 'playwright/tests/visual/toolbar.test.ts-snapshots/persistent-toolbar-link-editing.png' });
    });

    test('Persistent toolbar stays with selection when editing existing link', async ({ page }) => {
        // Navigate to persistent toolbar example
        await page.goto('http://localhost:3000/examples/persistent-toolbar.html');
        await page.waitForSelector('.content', { state: 'visible' });
        
        // Initially should be persistent at top
        const toolbar = await page.locator('#persistent-toolbar');
        await expect(toolbar).toBeVisible();
        await expect(toolbar).toHaveClass(/persistent-position/);
        
        // Take screenshot of initial state
        await page.screenshot({ path: 'playwright/tests/visual/toolbar.test.ts-snapshots/persistent-toolbar-existing-initial.png', fullPage: true });
        
        // Create a link
        await createLink(page, 'Lorem ipsum', 'https://example.com');
        
        // Select the link text and wait for toolbar to appear
        await selectText(page, 'Lorem ipsum');
        await page.waitForTimeout(500); // Wait for toolbar animation
        await expect(toolbar).toBeVisible();
        
        // Click link button
        const linkButton = await toolbar.locator('button[title="Add Link"]');
        await expect(linkButton).toBeVisible();
        await linkButton.click();
        
        // Wait for animation
        await page.waitForTimeout(500);

        // Should maintain position at selection during link editing
        await expect(toolbar).toHaveClass(/following-selection/);
        await expect(toolbar).not.toHaveClass(/persistent-position/);
        
        // Take screenshot of link editing state
        await page.screenshot({ path: 'playwright/tests/visual/toolbar.test.ts-snapshots/persistent-toolbar-existing-editing.png', fullPage: true });
    });

    test('Persistent toolbar maintains selection position during scroll with link editing', async ({ page }) => {
        // Navigate to persistent toolbar example
        await page.goto('http://localhost:3000/examples/persistent-toolbar.html');
        await page.waitForSelector('.content', { state: 'visible' });
        
        // Initially should be persistent at top
        const toolbar = await page.locator('#persistent-toolbar');
        await expect(toolbar).toBeVisible();
        await expect(toolbar).toHaveClass(/persistent-position/);
        
        // Take screenshot of initial state
        await page.screenshot({ path: 'playwright/tests/visual/toolbar.test.ts-snapshots/persistent-toolbar-scroll-initial.png', fullPage: true });
        
        // Create a link
        await createLink(page, 'Lorem ipsum', 'https://example.com');
        
        // Select the link text and wait for toolbar to appear
        await selectText(page, 'Lorem ipsum');
        await page.waitForTimeout(500); // Wait for toolbar animation
        await expect(toolbar).toBeVisible();
        
        // Click link button
        const linkButton = await toolbar.locator('button[title="Add Link"]');
        await expect(linkButton).toBeVisible();
        await linkButton.click();
        
        // Wait for animation
        await page.waitForTimeout(500);

        // Should maintain position at selection during link editing
        await expect(toolbar).toHaveClass(/following-selection/);
        await expect(toolbar).not.toHaveClass(/persistent-position/);
        
        // Take screenshot before scroll
        await page.screenshot({ path: 'playwright/tests/visual/toolbar.test.ts-snapshots/persistent-toolbar-scroll-before.png', fullPage: true });
        
        // Scroll the page
        await page.evaluate(() => window.scrollBy(0, 200));
        
        // Wait for scroll to complete
        await page.waitForTimeout(500);
        
        // Take screenshot after scroll
        await page.screenshot({ path: 'playwright/tests/visual/toolbar.test.ts-snapshots/persistent-toolbar-scroll-after.png', fullPage: true });
        
        // Should still be following selection
        await expect(toolbar).toHaveClass(/following-selection/);
        await expect(toolbar).not.toHaveClass(/persistent-position/);
    });
}); 