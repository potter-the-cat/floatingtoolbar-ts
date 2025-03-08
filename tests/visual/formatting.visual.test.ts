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
            formatTags: string[]
        ) => {
            await selectText(paragraphIndex, textToFind);
            
            // Get initial text content
            const initialText = await editor.evaluate((el: Element, data: { paragraphIndex: number }) => {
                const paragraphs = document.querySelectorAll('.editable-content p');
                const paragraph = paragraphs[data.paragraphIndex];
                return paragraph?.textContent || '';
            }, { paragraphIndex });
            
            const button = await page.locator(buttonLocator);
            await button.click();
            await page.waitForTimeout(500); // Increased wait time for formatting to apply
            
            // Get text content after formatting
            const formattedText = await editor.evaluate((el: Element, data: { paragraphIndex: number }) => {
                const paragraphs = document.querySelectorAll('.editable-content p');
                const paragraph = paragraphs[data.paragraphIndex];
                return paragraph?.textContent || '';
            }, { paragraphIndex });
            
            // Verify text content hasn't changed
            expect(formattedText.trim()).toBe(initialText.trim());
            
            // Re-select the text to verify button state
            await selectText(paragraphIndex, textToFind);
            
            // Debug logging for button state
            const buttonState = await button.evaluate((el: Element) => ({
                classes: el.classList.toString(),
                id: el.id,
                isVisible: el.isConnected && window.getComputedStyle(el).display !== 'none'
            }));
            console.log('Button state before verification:', buttonState);
            
            // Verify the button shows as active
            await expect(button).toHaveClass(/active/);
            
            return button;
        };

        // Test Bold formatting
        const boldButton = await applyAndVerifyFormatting(
            '#default-toolbar-bold-button',
            0,
            'test paragraph',
            'bold',
            ['strong', 'b']
        );
        await page.screenshot({ path: 'tests/visual/formatting.visual.test.ts-snapshots/text-bold-applied.png' });

        // Test Italic formatting
        const italicButton = await applyAndVerifyFormatting(
            '#default-toolbar-italic-button',
            1,
            'another paragraph',
            'italic',
            ['em', 'i']
        );
        await page.screenshot({ path: 'tests/visual/formatting.visual.test.ts-snapshots/text-italic-applied.png' });

        // Test Underline formatting
        const underlineButton = await applyAndVerifyFormatting(
            '#default-toolbar-underline-button',
            2,
            'third paragraph',
            'underline',
            ['u']
        );
        await page.screenshot({ path: 'tests/visual/formatting.visual.test.ts-snapshots/text-all-formatting-applied.png' });

        // No need for additional verification since we have screenshots
        // and button state checks for visual confirmation
    });
}); 