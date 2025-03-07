import { screen } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { FloatingToolbar } from '../../core/FloatingToolbar';
import { ToolbarStyleManager } from '../../styles/toolbar';

describe('FloatingToolbar Component', () => {
    let container: HTMLElement;
    let toolbar: FloatingToolbar;

    beforeEach(() => {
        // Mock document.queryCommandState
        document.queryCommandState = jest.fn().mockReturnValue(false);
        
        // Set up the DOM
        container = document.createElement('div');
        container.innerHTML = `
            <div id="editor">
                <div class="content-wrapper">
                    <div class="editable-content" contenteditable="true">
                        <p>Test content</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(container);

        // Inject styles
        ToolbarStyleManager.injectRequiredStyles();
        ToolbarStyleManager.injectToolbarStyles();

        // Initialize toolbar
        toolbar = new FloatingToolbar({
            container: '#editor',
            content: '.editable-content',
            mode: 'floating',
            theme: 'dark',
            debug: false,
            toolbarId: 'test-toolbar',
            buttons: {
                text: {
                    bold: true,
                    italic: true,
                    underline: false,
                    strikethrough: false
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
                    dropCap: false,
                    code: false,
                    quote: false,
                    hr: false
                },
                list: {
                    bullet: false,
                    number: false
                },
                link: {
                    url: false
                }
            }
        });
    });

    afterEach(() => {
        document.body.removeChild(container);
        ToolbarStyleManager.cleanup();
        jest.restoreAllMocks();
    });

    test('toolbar is initially hidden', () => {
        const toolbarElement = document.getElementById('test-toolbar');
        expect(toolbarElement).not.toHaveClass('visible');
    });

    test('toolbar has correct button groups', () => {
        const toolbarElement = document.getElementById('test-toolbar');
        const groups = toolbarElement!.querySelectorAll('.toolbar-group');
        expect(groups).toHaveLength(1); // One group for text formatting

        const buttons = groups[0].querySelectorAll('button');
        expect(buttons).toHaveLength(2); // Bold and italic buttons
    });

    test('toolbar has correct theme class', () => {
        const toolbarElement = document.getElementById('test-toolbar');
        expect(toolbarElement).toHaveClass('theme-dark');
    });

    test('buttons have correct icons', () => {
        const boldButton = document.getElementById('test-toolbar-bold-button');
        const italicButton = document.getElementById('test-toolbar-italic-button');

        expect(boldButton!.querySelector('.material-icons')).toHaveTextContent('format_bold');
        expect(italicButton!.querySelector('.material-icons')).toHaveTextContent('format_italic');
    });

    test('toolbar appears on text selection', () => {
        const editor = container.querySelector('.editable-content')!;
        const range = document.createRange();
        range.selectNodeContents(editor.firstChild!);
        
        const selection = window.getSelection()!;
        selection.removeAllRanges();
        selection.addRange(range);

        // Dispatch necessary events
        editor.dispatchEvent(new Event('mouseup', { bubbles: true }));
        document.dispatchEvent(new Event('selectionchange'));

        const toolbarElement = document.getElementById('test-toolbar');
        expect(toolbarElement).toHaveClass('floating-toolbar');
        expect(toolbarElement?.style.display).not.toBe('none');
    });

    test('toolbar has correct CSS properties', () => {
        const toolbarElement = document.getElementById('test-toolbar');
        const styles = window.getComputedStyle(toolbarElement!);

        expect(styles.display).toBe('flex');
        expect(styles.alignItems).toBe('center');
        expect(styles.borderRadius).toBe('4px');
        expect(styles.padding).toBe('6px');
    });

    test('button groups have correct spacing', () => {
        const group = document.getElementById('test-toolbar')!.querySelector('.toolbar-group')!;
        const styles = window.getComputedStyle(group);

        expect(styles.display).toBe('flex');
        expect(styles.alignItems).toBe('center');
        expect(styles.margin).toBe('0px 2px');
    });
}); 