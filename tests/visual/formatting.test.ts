import { test, expect } from '@playwright/test';

test.describe('Text Formatting Visual Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the test page
        await page.goto('http://localhost:3000');
        
        // Wait for the editor to be ready
        await page.waitForSelector('.editable-content', { state: 'visible' });

        // Set up test content
        await page.evaluate(() => {
            const content = document.querySelector('.editable-content');
            if (content) {
                content.innerHTML = '<p>This is a test paragraph.</p>';
            }
        });
    });

    // Helper function to check button states
    const checkButtonStates = async (page) => {
        return await page.evaluate(() => {
            const buttons = ['bold', 'italic', 'underline', 'strikethrough'] as const;
            const states: Record<string, { classes: string; commandState: boolean; id: string; computedStyles: any }> = {};
            
            buttons.forEach(format => {
                const button = document.querySelector(`#default-toolbar-${format}-button`);
                const command = format === 'strikethrough' ? 'strikeThrough' : format;
                
                if (button) {
                    const computedStyle = window.getComputedStyle(button);
                    const relevantStyles = {
                        backgroundColor: computedStyle.backgroundColor,
                        color: computedStyle.color,
                        borderColor: computedStyle.borderColor,
                        opacity: computedStyle.opacity,
                        filter: computedStyle.filter,
                        transform: computedStyle.transform,
                        boxShadow: computedStyle.boxShadow,
                        outline: computedStyle.outline,
                        position: computedStyle.position,
                        zIndex: computedStyle.zIndex,
                        visibility: computedStyle.visibility,
                        display: computedStyle.display,
                        transition: computedStyle.transition
                    };

                    // Check pseudo-class states
                    const pseudoStates = {
                        hover: button.matches(':hover'),
                        active: button.matches(':active'),
                        focus: button.matches(':focus'),
                        focusVisible: button.matches(':focus-visible'),
                        focusWithin: button.matches(':focus-within')
                    };

                    states[format] = {
                        classes: button.classList.toString(),
                        commandState: document.queryCommandState(command),
                        id: button.id,
                        computedStyles: {
                            ...relevantStyles,
                            pseudoStates
                        }
                    };

                    // Log detailed state for debugging
                    console.log(`\nDetailed state for ${format} button:`, {
                        element: button.outerHTML,
                        computedStyles: relevantStyles,
                        pseudoStates,
                        parentComputedStyle: window.getComputedStyle(button.parentElement as Element),
                        toolbarState: {
                            classes: document.querySelector('#default-toolbar')?.classList.toString(),
                            visible: document.querySelector('#default-toolbar')?.classList.contains('visible'),
                            computedStyle: window.getComputedStyle(document.querySelector('#default-toolbar') as Element)
                        }
                    });
                }
            });
            
            return states;
        });
    };

    test('formatting buttons toggle text styles correctly', async ({ page }) => {
        // First, select text and capture initial state
        await page.evaluate(() => {
            const p = document.querySelector('.editable-content p');
            if (!p?.firstChild) return;
            
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
        });

        // Wait for toolbar to appear
        await page.waitForSelector('#default-toolbar', { state: 'visible' });
        await page.waitForTimeout(100);

        // Capture initial state
        const initialStates = await checkButtonStates(page);
        await page.screenshot({ path: 'tests/visual/formatting.simple.test.ts-snapshots/initial-state.png' });

        // Test each format
        const formats = [
            { 
                name: 'bold', 
                button: '#default-toolbar-bold-button',
                text: 'Testing bold formatting on this text.'
            },
            { 
                name: 'italic', 
                button: '#default-toolbar-italic-button',
                text: 'Testing italic formatting on this text.'
            },
            { 
                name: 'underline', 
                button: '#default-toolbar-underline-button',
                text: 'Testing underline formatting on this text.'
            },
            { 
                name: 'strikethrough', 
                button: '#default-toolbar-strikethrough-button',
                text: 'Testing strikethrough formatting on this text.'
            }
        ];

        for (const format of formats) {
            console.log(`\n=== Starting test cycle for ${format.name} ===`);
            
            // Update paragraph text for this format
            await page.evaluate((text) => {
                const p = document.querySelector('.editable-content p');
                if (p) p.textContent = text;
            }, format.text);

            // Select the text and trigger events
            await page.evaluate(() => {
                const p = document.querySelector('.editable-content p');
                if (!p?.firstChild) return;
                
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
            });

            // Wait for toolbar to appear
            await page.waitForSelector('#default-toolbar', { state: 'visible' });
            await page.waitForTimeout(100);

            console.log('\n--- Initial state ---');
            const initialStates = await checkButtonStates(page);
            console.log('Initial button states:', initialStates);

            // Apply formatting
            await page.click(format.button);
            await page.waitForTimeout(100);

            // Wait for formatting to be applied
            await page.evaluate((formatType) => {
                const command = formatType === 'strikethrough' ? 'strikeThrough' : formatType;
                let attempts = 0;
                while (!document.queryCommandState(command) && attempts < 10) {
                    attempts++;
                }
                console.log(`Format ${formatType} applied after ${attempts} attempts`);
            }, format.name);

            console.log('\n--- Applying format ---');
            const appliedStates = await checkButtonStates(page);
            console.log('States after applying format:', appliedStates);
            
            // Take screenshot after verifying format is applied
            expect(appliedStates[format.name].commandState).toBe(true);
            expect(appliedStates[format.name].classes).toContain('active');
            
            await page.screenshot({ 
                path: `tests/visual/formatting.simple.test.ts-snapshots/${format.name}-applied.png` 
            });
            
            console.log('\n--- Removing format ---');
            await page.click(format.button);
            await page.waitForTimeout(100);

            // Wait for formatting to be removed
            await page.evaluate((formatType) => {
                const command = formatType === 'strikethrough' ? 'strikeThrough' : formatType;
                let attempts = 0;
                while (document.queryCommandState(command) && attempts < 10) {
                    attempts++;
                }
                console.log(`Format ${formatType} removed after ${attempts} attempts`);
            }, format.name);

            const removedStates = await checkButtonStates(page);
            console.log('States after removing format:', removedStates);

            // Move mouse away from the button before taking screenshot
            await page.mouse.move(0, 0);
            await page.waitForTimeout(100); // Wait for hover state to clear

            // Take screenshot after verifying format is removed
            expect(removedStates[format.name].commandState).toBe(false);
            expect(removedStates[format.name].classes).not.toContain('active');

            await page.screenshot({ 
                path: `tests/visual/formatting.simple.test.ts-snapshots/${format.name}-removed.png` 
            });

            // Verify text is still selected
            const isSelected = await page.evaluate((expectedText) => {
                const selection = window.getSelection();
                return selection?.toString().trim() === expectedText;
            }, format.text);
            expect(isSelected).toBe(true);
        }
    });

    test('formatting buttons start inactive when text is selected', async ({ page }) => {
        // Update content with descriptive text
        await page.evaluate(() => {
            const content = document.querySelector('.editable-content');
            if (content) {
                content.innerHTML = '<p>This text has no formatting applied yet.</p>';
            }
        });

        // Select the text and trigger events
        const isSelected = await page.evaluate(() => {
            const p = document.querySelector('.editable-content p');
            if (!p?.firstChild) {
                console.log('No text node found');
                return false;
            }
            
            try {
                const range = document.createRange();
                range.selectNodeContents(p);
                
                const selection = window.getSelection();
                selection?.removeAllRanges();
                selection?.addRange(range);

                // Trigger mouseup event
                p.dispatchEvent(new MouseEvent('mouseup', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                }));

                // Trigger selectionchange event
                document.dispatchEvent(new Event('selectionchange', {
                    bubbles: true
                }));

                return selection?.toString().trim() === 'This text has no formatting applied yet.';
            } catch (error) {
                console.error('Selection error:', error);
                return false;
            }
        });

        expect(isSelected).toBe(true);

        // Wait for toolbar to appear and stabilize
        await page.waitForSelector('#default-toolbar', { state: 'visible' });
        await page.waitForTimeout(100);

        // Verify all buttons are inactive
        const states = await checkButtonStates(page);
        for (const [format, state] of Object.entries(states)) {
            if (typeof state === 'object' && state !== null) {
                expect('commandState' in state && state.commandState).toBe(false);
                expect('classes' in state && state.classes).not.toContain('active');
            }
        }

        // Take screenshot showing all buttons in their initial state
        await page.screenshot({ 
            path: 'tests/visual/formatting.simple.test.ts-snapshots/initial-selection.png' 
        });
    });
}); 