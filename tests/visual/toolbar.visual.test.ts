import { test, expect } from '@playwright/test';

test.describe('Floating Toolbar Visual Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');  // Adjust port as needed
    });

    async function selectText(page, selector: string) {
        await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (!element) return;

            const range = document.createRange();
            range.selectNodeContents(element);
            
            const selection = window.getSelection()!;
            selection.removeAllRanges();
            selection.addRange(range);

            // Dispatch necessary events
            element.dispatchEvent(new Event('mouseup', { bubbles: true }));
            document.dispatchEvent(new Event('selectionchange', { bubbles: true }));
        }, selector);

        // Give the toolbar time to appear
        await page.waitForTimeout(100);
    }

    test('Dark theme toolbar appears correctly on text selection', async ({ page }) => {
        await selectText(page, '.editable-content p');
        
        const toolbar = page.locator('#default-toolbar');
        await expect(toolbar).toBeVisible();
        await expect(toolbar).toHaveScreenshot('dark-theme-toolbar.png');
    });

    test('Light theme toolbar has correct styling', async ({ page }) => {
        await selectText(page, '.light-content p');
        
        const toolbar = page.locator('#light-toolbar');
        await expect(toolbar).toBeVisible();
        await expect(toolbar).toHaveScreenshot('light-theme-toolbar.png');
    });

    test('Custom theme toolbar matches design', async ({ page }) => {
        await selectText(page, '.themed-content p');
        
        const toolbar = page.locator('#themed-toolbar');
        await expect(toolbar).toBeVisible();
        await expect(toolbar).toHaveScreenshot('custom-theme-toolbar.png');
    });

    test('Toolbar groups are properly spaced', async ({ page }) => {
        await selectText(page, '.editable-content p');
        
        const toolbar = page.locator('#default-toolbar');
        await expect(toolbar).toBeVisible();
        
        // Check spacing between groups using margin
        const toolbarElement = await toolbar.evaluate((el) => {
            const group = el.querySelector('.toolbar-group');
            const styles = window.getComputedStyle(group!);
            return styles.margin;
        });
        expect(toolbarElement).toBe('0px 2px');
    });

    test('Link input appears correctly', async ({ page }) => {
        await selectText(page, '.editable-content p');
        
        const toolbar = page.locator('#default-toolbar');
        await expect(toolbar).toBeVisible();
        
        // Click the link button
        await page.click('#default-toolbar-link-button');
        
        // Wait for the link input to be visible and enabled
        const linkInput = page.locator('#default-toolbar .toolbar-link-input');
        await expect(linkInput).toHaveCSS('display', 'flex');
        
        // Verify the input is enabled and interactive
        const input = page.locator('#default-toolbar-link-input');
        await expect(input).toBeEnabled();
        await expect(input).toHaveCSS('pointer-events', 'auto');
    });

    test('Bold button toggles text formatting correctly', async ({ page }) => {
        // First, ensure the content is editable and add a test id
        await page.evaluate(() => {
            const p = document.querySelector('.editable-content p') as HTMLElement;
            if (p) {
                p.contentEditable = 'true';
                p.textContent = 'Test text for bold formatting';
                p.dataset.testId = 'bold-test-paragraph';
            }
        });

        // Select text
        await selectText(page, '[data-test-id="bold-test-paragraph"]');
        
        const toolbar = page.locator('#default-toolbar');
        await expect(toolbar).toBeVisible();
        
        // Click bold button
        await page.click('#default-toolbar-bold-button');
        
        // Wait for bold formatting to be applied
        await page.waitForFunction(() => {
            const p = document.querySelector('[data-test-id="bold-test-paragraph"]');
            const selection = window.getSelection();
            if (!selection || !selection.rangeCount) return false;
            
            const range = selection.getRangeAt(0);
            const boldElement = range.commonAncestorContainer.parentElement?.closest('b, strong');
            return !!boldElement;
        });

        // Take screenshot of bold text
        await page.locator('[data-test-id="bold-test-paragraph"]').screenshot({ path: 'test-results/bold-text.png' });
        
        // Clear selection
        await page.evaluate(() => {
            window.getSelection()?.removeAllRanges();
        });
        
        // Select text again
        await selectText(page, '[data-test-id="bold-test-paragraph"]');
        
        // Click bold button again
        await page.click('#default-toolbar-bold-button');
        
        // Wait for bold formatting to be removed
        await page.waitForFunction(() => {
            const p = document.querySelector('[data-test-id="bold-test-paragraph"]');
            const selection = window.getSelection();
            if (!selection || !selection.rangeCount) return false;
            
            const range = selection.getRangeAt(0);
            const boldElement = range.commonAncestorContainer.parentElement?.closest('b, strong');
            return !boldElement;
        });

        // Take screenshot of normal text
        await page.locator('[data-test-id="bold-test-paragraph"]').screenshot({ path: 'test-results/normal-text.png' });
    });

    test('Toolbar follows text selection when scrolling', async ({ page }) => {
        // Add long content to enable scrolling
        await page.evaluate(() => {
            const container = document.querySelector('.editable-content');
            if (container) {
                const longContent = document.createElement('div');
                longContent.innerHTML = `
                    <p>Text at the top</p>
                    <div style="height: 500px;"></div>
                    <p data-test-id="scroll-test-paragraph">This is the text we will select and scroll to</p>
                    <div style="height: 500px;"></div>
                `;
                container.appendChild(longContent);
            }
        });

        // Wait for content to be added
        await page.waitForSelector('[data-test-id="scroll-test-paragraph"]');

        // Scroll to our target paragraph and wait for scroll to complete
        const targetParagraph = page.locator('[data-test-id="scroll-test-paragraph"]');
        await targetParagraph.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500); // Wait for scroll to settle
        
        // Select the text
        await selectText(page, '[data-test-id="scroll-test-paragraph"]');
        
        // Wait for toolbar to appear and stabilize
        const toolbar = page.locator('#default-toolbar');
        await expect(toolbar).toBeVisible();
        await page.waitForTimeout(100);

        // Take screenshot of initial position
        await page.screenshot({ path: 'test-results/toolbar-before-scroll.png' });
        
        // Get initial positions
        const initialPositions = await page.evaluate(() => {
            const toolbar = document.querySelector('#default-toolbar');
            const paragraph = document.querySelector('[data-test-id="scroll-test-paragraph"]');
            if (!toolbar || !paragraph) return null;
            
            const toolbarRect = toolbar.getBoundingClientRect();
            const paragraphRect = paragraph.getBoundingClientRect();
            
            return {
                paragraphTop: paragraphRect.top,
                toolbarBottom: toolbarRect.bottom,
                toolbarTop: toolbarRect.top,
                viewportHeight: window.innerHeight
            };
        });
        
        // Verify initial toolbar position
        expect(initialPositions).not.toBeNull();
        // Toolbar should be above the paragraph by default
        expect(initialPositions?.toolbarBottom).toBeLessThanOrEqual(initialPositions?.paragraphTop!);
        expect(initialPositions?.toolbarTop).toBeGreaterThanOrEqual(0); // Not above viewport
        
        // Scroll by 100px and wait for position update
        await page.evaluate(() => {
            window.scrollBy(0, 100);
            return new Promise(resolve => requestAnimationFrame(resolve));
        });
        await page.waitForTimeout(100);

        // Take screenshot after scroll
        await page.screenshot({ path: 'test-results/toolbar-after-scroll.png' });
        
        // Get new positions
        const newPositions = await page.evaluate(() => {
            const toolbar = document.querySelector('#default-toolbar');
            const paragraph = document.querySelector('[data-test-id="scroll-test-paragraph"]');
            if (!toolbar || !paragraph) return null;
            
            const toolbarRect = toolbar.getBoundingClientRect();
            const paragraphRect = paragraph.getBoundingClientRect();
            
            return {
                paragraphTop: paragraphRect.top,
                toolbarBottom: toolbarRect.bottom,
                toolbarTop: toolbarRect.top,
                viewportHeight: window.innerHeight
            };
        });
        
        // Verify toolbar position after scroll
        expect(newPositions).not.toBeNull();
        // Toolbar should still be above the paragraph
        expect(newPositions?.toolbarBottom).toBeLessThanOrEqual(newPositions?.paragraphTop!);
        expect(newPositions?.toolbarTop).toBeGreaterThanOrEqual(0); // Not above viewport
        
        // Verify the relative positioning is maintained
        const initialGap = initialPositions!.paragraphTop - initialPositions!.toolbarBottom;
        const newGap = newPositions!.paragraphTop - newPositions!.toolbarBottom;
        expect(Math.abs(initialGap - newGap)).toBeLessThanOrEqual(1); // Allow 1px difference for rounding
    });

    test('Toolbar positions below text when not enough space above', async ({ page }) => {
        await page.setContent(`
            <style>
                .header {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 106px;
                    background: #333;
                    z-index: 1100;
                }
                body {
                    padding-top: 106px;
                    margin: 0;
                }
                .content-wrapper {
                    position: relative;
                    padding: 20px;
                }
                p {
                    margin: 0;
                    line-height: 1.5;
                }
            </style>
            <div class="header"></div>
            <div class="content-wrapper">
                <div class="content" contenteditable="true">
                    <p>This is a paragraph that will be selected.</p>
                    ${Array(20).fill('<p>Additional content to enable scrolling</p>').join('')}
                </div>
            </div>
        `);

        // Get the first paragraph
        const paragraph = await page.locator('p').first();
        
        // Get initial positions
        await paragraph.evaluate(el => {
            const rect = el.getBoundingClientRect();
            console.log('Initial paragraph position:', {
                top: rect.top,
                bottom: rect.bottom,
                height: rect.height
            });
        });

        // Select the text
        await paragraph.selectText();
        
        // Wait for toolbar to appear and get its position
        const toolbar = await page.locator('.floating-toolbar');
        await toolbar.waitFor({ state: 'visible' });
        
        // Take screenshot of initial position
        await page.screenshot({ path: 'test-results/toolbar-initial.png' });
        
        // Log initial positions
        const initialPositions = await page.evaluate(() => {
            const toolbar = document.querySelector('.floating-toolbar');
            const paragraph = document.querySelector('p');
            const header = document.querySelector('.header');
            if (!toolbar || !paragraph || !header) return null;
            
            const toolbarRect = toolbar.getBoundingClientRect();
            const paragraphRect = paragraph.getBoundingClientRect();
            const headerRect = header.getBoundingClientRect();
            
            return {
                toolbarTop: toolbarRect.top,
                toolbarBottom: toolbarRect.bottom,
                paragraphTop: paragraphRect.top,
                paragraphBottom: paragraphRect.bottom,
                headerTop: headerRect.top,
                headerBottom: headerRect.bottom,
                hasBelow: toolbar.classList.contains('below'),
                viewportHeight: window.innerHeight,
                scrollY: window.scrollY,
                spaceAbove: paragraphRect.top - headerRect.bottom,
                effectiveSpaceAbove: paragraphRect.top - headerRect.bottom - (toolbarRect.height + 10), // 10 is offset.y
                headerHeight: headerRect.height
            };
        });
        
        console.log('Initial positions:', initialPositions);
        
        // Scroll down to reduce space above the paragraph
        await page.evaluate(() => {
            window.scrollTo(0, 153); // Scroll enough to make space above too small
        });
        
        // Take screenshot after scrolling
        await page.screenshot({ path: 'test-results/toolbar-scrolled.png' });
        
        // Clear selection and reselect to trigger toolbar repositioning
        await page.keyboard.press('Escape');
        await paragraph.selectText();
        
        // Wait for toolbar to reposition
        await page.waitForTimeout(300); // Wait for animations
        
        // Take screenshot of final position
        await page.screenshot({ path: 'test-results/toolbar-final.png' });
        
        // Get final positions
        const finalPositions = await page.evaluate(() => {
            const toolbar = document.querySelector('.floating-toolbar');
            const paragraph = document.querySelector('p');
            const header = document.querySelector('.header');
            if (!toolbar || !paragraph || !header) return null;
            
            const toolbarRect = toolbar.getBoundingClientRect();
            const paragraphRect = paragraph.getBoundingClientRect();
            const headerRect = header.getBoundingClientRect();
            
            return {
                toolbarTop: toolbarRect.top,
                toolbarBottom: toolbarRect.bottom,
                paragraphTop: paragraphRect.top,
                paragraphBottom: paragraphRect.bottom,
                headerTop: headerRect.top,
                headerBottom: headerRect.bottom,
                hasBelow: toolbar.classList.contains('below'),
                viewportHeight: window.innerHeight,
                scrollY: window.scrollY,
                spaceAbove: paragraphRect.top - headerRect.bottom,
                effectiveSpaceAbove: paragraphRect.top - headerRect.bottom - (toolbarRect.height + 10), // 10 is offset.y
                headerHeight: headerRect.height
            };
        });
        
        console.log('Final positions:', finalPositions);
        
        // Verify positions
        expect(finalPositions).not.toBeNull();
        if (finalPositions?.effectiveSpaceAbove !== undefined) {
            expect(finalPositions.effectiveSpaceAbove).toBeLessThan(0);
        }
        if (finalPositions?.paragraphBottom !== undefined && finalPositions?.toolbarTop !== undefined) {
            expect(finalPositions.toolbarTop).toBeGreaterThanOrEqual(finalPositions.paragraphBottom);
        }
        expect(finalPositions?.hasBelow).toBe(true);
        if (finalPositions?.headerBottom !== undefined && finalPositions?.toolbarTop !== undefined) {
            expect(finalPositions.toolbarTop).toBeGreaterThanOrEqual(finalPositions.headerBottom);
        }
        if (finalPositions?.toolbarBottom !== undefined && finalPositions?.viewportHeight !== undefined) {
            expect(finalPositions.toolbarBottom).toBeLessThanOrEqual(finalPositions.viewportHeight);
        }
    });
}); 