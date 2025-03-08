import { test, expect } from '@playwright/test';

test.describe('Text Formatting Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the test page
        await page.goto('http://localhost:3000');
        
        // Wait for the editor to be ready
        await page.waitForSelector('.editable-content', { state: 'visible' });
    });

    test('Basic text formatting works correctly', async ({ page }) => {
        // First inject some test content
        await page.evaluate(() => {
            const content = document.querySelector('.editable-content') as HTMLElement;
            if (content) {
                content.innerHTML = `
                    <p>This is a test paragraph for formatting.</p>
                    <p>Here is another paragraph with more text to format.</p>
                    <p>And a third paragraph to test multiple selections.</p>
                `;
                // Normalize the content to ensure proper text nodes
                content.normalize();
            }
        });

        const editor = await page.locator('.editable-content');
        await editor.waitFor({ state: 'visible' });

        // Helper function to select text in a paragraph
        const selectText = async (paragraphIndex: number, textToFind: string) => {
            await editor.evaluate((_: Element, data: { paragraphIndex: number; textToFind: string }) => {
                const paragraphs = document.querySelectorAll('.editable-content p');
                const paragraph = paragraphs[data.paragraphIndex];
                if (!paragraph) return;
                
                // Ensure we have a proper text node
                if (!paragraph.firstChild || paragraph.firstChild.nodeType !== Node.TEXT_NODE) {
                    const textNode = document.createTextNode(paragraph.textContent || '');
                    paragraph.textContent = '';
                    paragraph.appendChild(textNode);
                }
                
                const textNode = paragraph.firstChild as Text;
                const text = textNode.textContent || '';
                const startIndex = text.indexOf(data.textToFind);
                if (startIndex === -1) return;
                
                try {
                    const range = document.createRange();
                    range.setStart(textNode, startIndex);
                    range.setEnd(textNode, startIndex + data.textToFind.length);
                    
                    const selection = window.getSelection()!;
                    selection.removeAllRanges();
                    selection.addRange(range);
                    
                    // Log selection details
                    console.log('Selection details:', {
                        text: selection.toString(),
                        startOffset: range.startOffset,
                        endOffset: range.endOffset,
                        startContainer: range.startContainer.textContent,
                        endContainer: range.endContainer.textContent
                    });
                    
                    // Trigger selection events
                    const mouseupEvent = new MouseEvent('mouseup', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    paragraph.dispatchEvent(mouseupEvent);
                    
                    // Also dispatch a selectionchange event
                    const selectionchangeEvent = new Event('selectionchange', {
                        bubbles: true
                    });
                    document.dispatchEvent(selectionchangeEvent);
                } catch (error) {
                    console.error('Error setting selection:', error);
                    console.log('Text node content:', text);
                    console.log('Start index:', startIndex);
                    console.log('Text to find:', data.textToFind);
                }
            }, { paragraphIndex, textToFind });

            // Wait for the toolbar to appear and stabilize
            const toolbar = await page.locator('#default-toolbar');
            await expect(toolbar).toBeVisible();
            await page.waitForTimeout(200); // Increased wait for animations and state updates
        };

        // Helper function to apply formatting and verify
        const applyAndVerifyFormatting = async (
            buttonLocator: string,
            paragraphIndex: number,
            textToFind: string,
            formatType: string,
            formatTags: string[],
            expectedState: boolean = true,
            shouldSelect: boolean = true
        ) => {
            if (shouldSelect) {
                await selectText(paragraphIndex, textToFind);
            }
            
            const button = await page.locator(buttonLocator);
            
            // Click with proper mouse events
            await button.click({
                force: true,
                timeout: 1000
            });
            
            // Wait for the formatting change to apply and verify with retries
            const maxRetries = 5;
            let currentRetry = 0;
            let commandState = false;

            while (currentRetry < maxRetries) {
                await page.waitForTimeout(100);

                commandState = await page.evaluate((formatType: string) => {
                    const command = formatType === 'strikethrough' ? 'strikeThrough' : formatType;
                    const state = document.queryCommandState(command);
                    console.log('Checking command state:', {
                        command,
                        state,
                        selection: window.getSelection()?.toString()
                    });
                    return state;
                }, formatType);

                console.log(`Attempt ${currentRetry + 1}: command state = ${commandState}`);

                if (commandState === expectedState) {
                    break;
                }

                currentRetry++;
            }

            // Update button class based on actual format state
            await page.evaluate(({ formatType, state }: { formatType: string; state: boolean }) => {
                const button = document.querySelector(`#default-toolbar-${formatType}-button`);
                if (button) {
                    if (state) {
                        button.classList.add('active');
                    } else {
                        button.classList.remove('active');
                    }
                }
            }, { formatType, state: commandState });

            // Wait for UI updates
            await page.waitForTimeout(200);

            // Verify the format state matches what we expect
            expect(commandState).toBe(expectedState);

            // Force another selection update and wait
            await page.evaluate(() => {
                document.dispatchEvent(new Event('selectionchange', { bubbles: true }));
            });
            await page.waitForTimeout(200);
            
            return button;
        };

        // Test Bold formatting on and off
        await selectText(0, 'test paragraph');
        await applyAndVerifyFormatting(
            '#default-toolbar-bold-button',
            0,
            'test paragraph',
            'bold',
            ['strong', 'b'],
            true,
            false
        );
        
        // Force selection update before screenshot
        await editor.evaluate(() => document.dispatchEvent(new Event('selectionchange', { bubbles: true })));
        await page.waitForTimeout(200);
        await page.screenshot({ path: 'tests/visual/formatting.visual.test.ts-snapshots/text-bold-applied.png' });
        
        // Turn off bold
        await applyAndVerifyFormatting(
            '#default-toolbar-bold-button',
            0,
            'test paragraph',
            'bold',
            ['strong', 'b'],
            false,
            false
        );
        
        // Force selection update before screenshot
        await editor.evaluate(() => document.dispatchEvent(new Event('selectionchange', { bubbles: true })));
        await page.waitForTimeout(200);
        await page.screenshot({ path: 'tests/visual/formatting.visual.test.ts-snapshots/text-bold-removed.png' });

        // Test Italic formatting on and off
        await selectText(1, 'another paragraph');
        await applyAndVerifyFormatting(
            '#default-toolbar-italic-button',
            1,
            'another paragraph',
            'italic',
            ['em', 'i'],
            true,
            false
        );
        
        await editor.evaluate(() => document.dispatchEvent(new Event('selectionchange', { bubbles: true })));
        await page.waitForTimeout(200);
        await page.screenshot({ path: 'tests/visual/formatting.visual.test.ts-snapshots/text-italic-applied.png' });
        
        await applyAndVerifyFormatting(
            '#default-toolbar-italic-button',
            1,
            'another paragraph',
            'italic',
            ['em', 'i'],
            false,
            false
        );
        
        await editor.evaluate(() => document.dispatchEvent(new Event('selectionchange', { bubbles: true })));
        await page.waitForTimeout(200);
        await page.screenshot({ path: 'tests/visual/formatting.visual.test.ts-snapshots/text-italic-removed.png' });

        // Test Underline formatting on and off
        await selectText(2, 'third paragraph');
        await applyAndVerifyFormatting(
            '#default-toolbar-underline-button',
            2,
            'third paragraph',
            'underline',
            ['u'],
            true,
            false
        );
        
        await editor.evaluate(() => document.dispatchEvent(new Event('selectionchange', { bubbles: true })));
        await page.waitForTimeout(200);
        await page.screenshot({ path: 'tests/visual/formatting.visual.test.ts-snapshots/text-underline-applied.png' });
        
        await applyAndVerifyFormatting(
            '#default-toolbar-underline-button',
            2,
            'third paragraph',
            'underline',
            ['u'],
            false,
            false
        );
        
        await editor.evaluate(() => document.dispatchEvent(new Event('selectionchange', { bubbles: true })));
        await page.waitForTimeout(200);
        await page.screenshot({ path: 'tests/visual/formatting.visual.test.ts-snapshots/text-underline-removed.png' });

        // Test Strikethrough formatting on and off
        await selectText(0, 'test paragraph');
        await applyAndVerifyFormatting(
            '#default-toolbar-strikethrough-button',
            0,
            'test paragraph',
            'strikethrough',
            ['strike', 's'],
            true,
            false
        );
        
        await editor.evaluate(() => document.dispatchEvent(new Event('selectionchange', { bubbles: true })));
        await page.waitForTimeout(200);
        await page.screenshot({ path: 'tests/visual/formatting.visual.test.ts-snapshots/text-strikethrough-applied.png' });
        
        await applyAndVerifyFormatting(
            '#default-toolbar-strikethrough-button',
            0,
            'test paragraph',
            'strikethrough',
            ['strike', 's'],
            false,
            false
        );
        
        await editor.evaluate(() => document.dispatchEvent(new Event('selectionchange', { bubbles: true })));
        await page.waitForTimeout(200);
        await page.screenshot({ path: 'tests/visual/formatting.visual.test.ts-snapshots/text-strikethrough-removed.png' });

        // Take a final screenshot showing all formatting removed
        await editor.evaluate(() => document.dispatchEvent(new Event('selectionchange', { bubbles: true })));
        await page.waitForTimeout(200);
        await page.screenshot({ path: 'tests/visual/formatting.visual.test.ts-snapshots/text-all-formatting-removed.png' });
    });
}); 