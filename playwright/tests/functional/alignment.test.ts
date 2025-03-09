import { test, expect, Page } from '@playwright/test';

test.describe('Text Alignment Functional Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the test page
        await page.goto('http://localhost:3000/examples/floating-toolbar.html');
        
        // Wait for the editor to be ready
        await page.waitForSelector('.editable-content', { state: 'visible' });

        // Set up test content with multiple paragraphs
        await page.evaluate(() => {
            const content = document.querySelector('.editable-content');
            if (content) {
                content.innerHTML = `
                    <p>This is the first paragraph for testing text alignment. It should be long enough to demonstrate alignment effects clearly across multiple lines of text.</p>
                    <p>This is the second paragraph for testing text alignment. We'll use this to test different alignment options.</p>
                    <p>This is the third paragraph for testing text alignment. Having multiple paragraphs helps verify that alignment is applied correctly.</p>
                `;
            }
        });
    });

    // Helper function to clear all states
    const clearStates = async (page: Page) => {
        await page.mouse.move(-200, -200);
        await page.waitForTimeout(500);
        await page.evaluate(() => {
            const activeElement = document.activeElement;
            if (activeElement instanceof HTMLElement) {
                activeElement.blur();
            }
        });
        await page.keyboard.press('Escape');
        await page.waitForTimeout(100);
        await page.keyboard.up('Escape');
        await page.waitForTimeout(100);
    };

    // Helper function to check alignment button states
    const checkAlignmentButtonStates = async (page: Page) => {
        return await page.evaluate(() => {
            const alignments = ['align-left', 'align-center', 'align-right', 'align-justify'] as const;
            const states: Record<string, { classes: string; commandState: boolean; id: string }> = {};
            
            alignments.forEach(alignment => {
                const button = document.querySelector(`#default-toolbar-${alignment}-button`);
                const command = alignment === 'align-left' ? 'justifyLeft' : 
                               alignment === 'align-center' ? 'justifyCenter' : 
                               alignment === 'align-right' ? 'justifyRight' : 'justifyFull';
                
                if (button) {
                    states[alignment] = {
                        classes: button.classList.toString(),
                        commandState: document.queryCommandState(command),
                        id: button.id
                    };
                }
            });
            
            return states;
        });
    };

    // Helper function to select a paragraph by index (0-based)
    const selectParagraph = async (page: Page, index: number) => {
        await page.evaluate((idx) => {
            const paragraphs = document.querySelectorAll('.editable-content p');
            if (paragraphs.length > idx) {
                const p = paragraphs[idx];
                
                const range = document.createRange();
                range.selectNodeContents(p);
                
                const selection = window.getSelection();
                selection?.removeAllRanges();
                selection?.addRange(range);

                // Trigger events
                p.dispatchEvent(new MouseEvent('mouseup', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                }));
                document.dispatchEvent(new Event('selectionchange', { bubbles: true }));
            }
        }, index);

        // Wait for toolbar to appear
        await page.waitForSelector('#default-toolbar', { state: 'visible' });
        await page.waitForTimeout(100);
    };

    // Helper function to get the current alignment of a paragraph
    const getParagraphAlignment = async (page: Page, index: number) => {
        return await page.evaluate((idx) => {
            const paragraphs = document.querySelectorAll('.editable-content p');
            if (paragraphs.length > idx) {
                const p = paragraphs[idx];
                const style = window.getComputedStyle(p);
                return style.textAlign;
            }
            return null;
        }, index);
    };

    test('alignment buttons appear in toolbar', async ({ page }) => {
        // Select the first paragraph
        await selectParagraph(page, 0);
        
        // Check if alignment buttons are visible
        const alignLeftButton = await page.locator('#default-toolbar-align-left-button');
        const alignCenterButton = await page.locator('#default-toolbar-align-center-button');
        const alignRightButton = await page.locator('#default-toolbar-align-right-button');
        const alignJustifyButton = await page.locator('#default-toolbar-align-justify-button');
        
        await expect(alignLeftButton).toBeVisible();
        await expect(alignCenterButton).toBeVisible();
        await expect(alignRightButton).toBeVisible();
        await expect(alignJustifyButton).toBeVisible();
        
        // Take a screenshot of the toolbar with alignment buttons
        await page.screenshot({ 
            path: 'playwright/tests/functional/alignment.test.ts-snapshots/alignment-buttons.png',
            animations: 'disabled'
        });
    });

    test('left alignment applies correctly', async ({ page }) => {
        // Select the first paragraph
        await selectParagraph(page, 0);
        
        // Click the left align button
        await page.click('#default-toolbar-align-left-button');
        await page.waitForTimeout(100);
        
        // Check if the paragraph is left-aligned
        const alignment = await getParagraphAlignment(page, 0);
        // 'start' is equivalent to 'left' in many browsers
        expect(['left', 'start']).toContain(alignment);
        
        // Check if the left align button is active
        const buttonStates = await checkAlignmentButtonStates(page);
        expect(buttonStates['align-left'].classes).toContain('active');
        expect(buttonStates['align-center'].classes).not.toContain('active');
        expect(buttonStates['align-right'].classes).not.toContain('active');
        expect(buttonStates['align-justify'].classes).not.toContain('active');
        
        // Take a screenshot of the left-aligned text
        await page.screenshot({ 
            path: 'playwright/tests/functional/alignment.test.ts-snapshots/left-aligned-text.png',
            animations: 'disabled'
        });
    });

    test('center alignment applies correctly', async ({ page }) => {
        // Select the first paragraph
        await selectParagraph(page, 0);
        
        // Click the center align button
        await page.click('#default-toolbar-align-center-button');
        await page.waitForTimeout(100);
        
        // Check if the paragraph is center-aligned
        const alignment = await getParagraphAlignment(page, 0);
        expect(alignment).toBe('center');
        
        // Check if the center align button is active
        const buttonStates = await checkAlignmentButtonStates(page);
        expect(buttonStates['align-left'].classes).not.toContain('active');
        expect(buttonStates['align-center'].classes).toContain('active');
        expect(buttonStates['align-right'].classes).not.toContain('active');
        expect(buttonStates['align-justify'].classes).not.toContain('active');
        
        // Take a screenshot of the center-aligned text
        await page.screenshot({ 
            path: 'playwright/tests/functional/alignment.test.ts-snapshots/center-aligned-text.png',
            animations: 'disabled'
        });
    });

    test('right alignment applies correctly', async ({ page }) => {
        // Select the first paragraph
        await selectParagraph(page, 0);
        
        // Click the right align button
        await page.click('#default-toolbar-align-right-button');
        await page.waitForTimeout(100);
        
        // Check if the paragraph is right-aligned
        const alignment = await getParagraphAlignment(page, 0);
        expect(alignment).toBe('right');
        
        // Check if the right align button is active
        const buttonStates = await checkAlignmentButtonStates(page);
        expect(buttonStates['align-left'].classes).not.toContain('active');
        expect(buttonStates['align-center'].classes).not.toContain('active');
        expect(buttonStates['align-right'].classes).toContain('active');
        expect(buttonStates['align-justify'].classes).not.toContain('active');
        
        // Take a screenshot of the right-aligned text
        await page.screenshot({ 
            path: 'playwright/tests/functional/alignment.test.ts-snapshots/right-aligned-text.png',
            animations: 'disabled'
        });
    });

    test('justify alignment applies correctly', async ({ page }) => {
        // Select the first paragraph
        await selectParagraph(page, 0);
        
        // Click the justify align button
        await page.click('#default-toolbar-align-justify-button');
        await page.waitForTimeout(100);
        
        // Check if the paragraph is justify-aligned
        const alignment = await getParagraphAlignment(page, 0);
        expect(alignment).toBe('justify');
        
        // Check if the justify align button is active
        const buttonStates = await checkAlignmentButtonStates(page);
        expect(buttonStates['align-left'].classes).not.toContain('active');
        expect(buttonStates['align-center'].classes).not.toContain('active');
        expect(buttonStates['align-right'].classes).not.toContain('active');
        expect(buttonStates['align-justify'].classes).toContain('active');
        
        // Take a screenshot of the justify-aligned text
        await page.screenshot({ 
            path: 'playwright/tests/functional/alignment.test.ts-snapshots/justify-aligned-text.png',
            animations: 'disabled'
        });
    });

    test('multiple paragraphs can have different alignments', async ({ page }) => {
        // Align first paragraph left
        await selectParagraph(page, 0);
        await page.click('#default-toolbar-align-left-button');
        await page.waitForTimeout(100);
        
        // Align second paragraph center
        await selectParagraph(page, 1);
        await page.click('#default-toolbar-align-center-button');
        await page.waitForTimeout(100);
        
        // Align third paragraph right
        await selectParagraph(page, 2);
        await page.click('#default-toolbar-align-right-button');
        await page.waitForTimeout(100);
        
        // Check alignments
        const alignment1 = await getParagraphAlignment(page, 0);
        const alignment2 = await getParagraphAlignment(page, 1);
        const alignment3 = await getParagraphAlignment(page, 2);
        
        // 'start' is equivalent to 'left' in many browsers
        expect(['left', 'start']).toContain(alignment1);
        expect(alignment2).toBe('center');
        expect(alignment3).toBe('right');
        
        // Take a screenshot of the mixed-aligned text
        await page.screenshot({ 
            path: 'playwright/tests/functional/alignment.test.ts-snapshots/mixed-aligned-text.png',
            animations: 'disabled'
        });
    });

    test('alignment button state updates when selecting differently aligned paragraphs', async ({ page }) => {
        // Set up paragraphs with different alignments
        await page.evaluate(() => {
            const paragraphs = document.querySelectorAll('.editable-content p');
            if (paragraphs.length >= 3) {
                // Use 'start' instead of 'left' for better browser compatibility
                (paragraphs[0] as HTMLElement).style.textAlign = 'start';
                (paragraphs[1] as HTMLElement).style.textAlign = 'center';
                (paragraphs[2] as HTMLElement).style.textAlign = 'right';
            }
        });
        
        // Select first paragraph and check button state
        await selectParagraph(page, 0);
        let buttonStates = await checkAlignmentButtonStates(page);
        expect(buttonStates['align-left'].classes).toContain('active');
        
        // Select second paragraph and check button state
        await selectParagraph(page, 1);
        buttonStates = await checkAlignmentButtonStates(page);
        expect(buttonStates['align-center'].classes).toContain('active');
        
        // Select third paragraph and check button state
        await selectParagraph(page, 2);
        buttonStates = await checkAlignmentButtonStates(page);
        expect(buttonStates['align-right'].classes).toContain('active');
    });
}); 