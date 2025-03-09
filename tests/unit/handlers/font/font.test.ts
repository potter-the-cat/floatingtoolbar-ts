import { FontHandler } from '../../../../src/core/handlers/FontHandler';
import { ToolbarConfig, ToolbarState, ToolbarElements, ButtonElements } from '../../../../src/core/types';

// Mock the googleFonts module
jest.mock('../../../../src/utils/googleFonts', () => ({
    loadGoogleFonts: jest.fn().mockResolvedValue(undefined),
    isGoogleFontLoaded: jest.fn().mockReturnValue(true)
}));

describe('FontHandler', () => {
    let mockConfig: ToolbarConfig;
    let mockState: ToolbarState;
    let mockElements: ToolbarElements;
    let fontHandler: FontHandler;
    let updateViewMock: jest.Mock;

    beforeEach(() => {
        // Setup fake timers
        jest.useFakeTimers();
        
        // Mock DOM elements
        document.body.innerHTML = `
            <div id="editor">
                <div class="editable-content">
                    <p>Test content</p>
                </div>
            </div>
        `;

        // Mock getComputedStyle
        const originalGetComputedStyle = window.getComputedStyle;
        window.getComputedStyle = jest.fn((element: Element) => {
            const style = originalGetComputedStyle(element);
            return {
                ...style,
                fontFamily: element.getAttribute('style')?.match(/font-family:\s*([^;]+)/)?.[1] || style.fontFamily
            };
        });

        // Create mock elements
        const container = document.createElement('div');
        const toolbar = document.createElement('div');
        const fontButton = document.createElement('button');
        const fontNameElement = document.createElement('span');
        fontNameElement.className = 'font-name';
        fontButton.appendChild(fontNameElement);
        fontButton.id = 'default-toolbar-font-button';
        const toolbarFontSelect = document.createElement('div');
        const toolbarInitial = document.createElement('div');
        const toolbarLinkInput = document.createElement('input');
        const linkButton = document.createElement('button');
        
        toolbarFontSelect.className = 'toolbar-font-select';

        // Set up mock config
        mockConfig = {
            container: '#editor',
            content: '.editable-content',
            selector: '',
            mode: 'floating',
            theme: 'light',
            debug: false,
            useExistingToolbar: false,
            buttons: {
                text: {
                    bold: true,
                    italic: true,
                    underline: true,
                    strikethrough: true
                },
                script: {
                    subscript: true,
                    superscript: true
                },
                heading: {
                    h1: true,
                    h2: true
                },
                special: {
                    code: true,
                    quote: true,
                    dropCap: true,
                    hr: true
                },
                list: {
                    bullet: true,
                    number: true
                },
                link: {
                    url: true
                },
                font: {
                    enabled: true
                }
            },
            offset: { x: 0, y: 0 },
            persistentPosition: {
                top: 0,
                center: true
            },
            toolbarId: 'default-toolbar',
            resizeDebounceMs: 100
        } as ToolbarConfig;

        // Set up mock state
        mockState = {
            isVisible: false,
            isPersistent: false,
            isAtPersistentPosition: false,
            currentView: 'initial',
            selectedText: null,
            selectionRect: null,
            selectionRange: null,
            currentSelection: null,
            existingLink: null,
            linkUrl: '',
            isValidUrl: false,
            toolbarRect: null,
            wrapperRect: null,
            spaceAbove: 0,
            spaceBelow: 0,
            isProcessingLinkClick: false,
            positionObserver: null,
            position: { x: 0, y: 0 },
            resizeTimeout: undefined,
            activeFormats: new Set(),
            dropCapElements: new Set(),
            currentFont: '',
            loadedGoogleFonts: new Set()
        };

        // Set up mock elements
        const mockButtons: ButtonElements = {
            code: { element: document.createElement('button'), enabled: true },
            h1: { element: document.createElement('button'), enabled: true },
            h2: { element: document.createElement('button'), enabled: true },
            hr: { element: document.createElement('button'), enabled: true },
            bulletList: { element: document.createElement('button'), enabled: true },
            numberList: { element: document.createElement('button'), enabled: true },
            dropCap: { element: document.createElement('button'), enabled: true },
            quote: { element: document.createElement('button'), enabled: true },
            bold: { element: document.createElement('button'), enabled: true },
            italic: { element: document.createElement('button'), enabled: true },
            underline: { element: document.createElement('button'), enabled: true },
            strikethrough: { element: document.createElement('button'), enabled: true },
            subscript: { element: document.createElement('button'), enabled: true },
            superscript: { element: document.createElement('button'), enabled: true },
            font: { element: document.createElement('button'), enabled: true },
            alignLeft: { element: document.createElement('button'), enabled: true },
            alignCenter: { element: document.createElement('button'), enabled: true },
            alignRight: { element: document.createElement('button'), enabled: true },
            alignJustify: { element: document.createElement('button'), enabled: true }
        };

        mockElements = {
            container,
            toolbar,
            toolbarInitial,
            toolbarLinkInput,
            linkButton,
            fontButton,
            toolbarFontSelect,
            linkInput: document.createElement('input'),
            saveLink: document.createElement('button'),
            cancelLink: document.createElement('button'),
            removeLink: document.createElement('button'),
            visitLink: document.createElement('button'),
            boldButton: document.createElement('button'),
            italicButton: document.createElement('button'),
            underlineButton: document.createElement('button'),
            strikethroughButton: document.createElement('button'),
            subscriptButton: document.createElement('button'),
            superscriptButton: document.createElement('button'),
            h1Button: document.createElement('button'),
            h2Button: document.createElement('button'),
            dropCapButton: document.createElement('button'),
            codeButton: document.createElement('button'),
            quoteButton: document.createElement('button'),
            hrButton: document.createElement('button'),
            bulletListButton: document.createElement('button'),
            numberListButton: document.createElement('button'),
            fontList: document.createElement('div'),
            alignLeftButton: document.createElement('button'),
            alignCenterButton: document.createElement('button'),
            alignRightButton: document.createElement('button'),
            alignJustifyButton: document.createElement('button'),
            buttons: mockButtons
        };

        // Set up update view mock
        updateViewMock = jest.fn();

        // Create FontHandler instance
        fontHandler = new FontHandler({
            config: mockConfig,
            state: mockState,
            elements: mockElements,
            updateView: updateViewMock
        });
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    describe('initialization', () => {
        it('should initialize with default fonts if none provided', async () => {
            const configWithoutFonts = { ...mockConfig };
            delete configWithoutFonts.fontConfig;

            const handler = new FontHandler({
                config: configWithoutFonts,
                state: mockState,
                elements: mockElements,
                updateView: updateViewMock
            });

            await handler.initialize();
            // Access the config through the handler's context
            const handlerConfig = (handler as any).context.config;
            expect(handlerConfig.fontConfig).toBeDefined();
            expect(handlerConfig.fontConfig.defaultFonts).toBeDefined();
            expect(handlerConfig.fontConfig.googleFonts).toBeDefined();
        });

        it('should not initialize if font button is disabled', async () => {
            mockConfig.buttons.font!.enabled = false;
            await fontHandler.initialize();
            expect(mockElements.toolbarFontSelect?.style.display).not.toBe('block');
        });

        it('should create font dropdown on initialization', async () => {
            await fontHandler.initialize();
            expect(mockElements.toolbarFontSelect).toBeDefined();
            expect(mockElements.toolbarFontSelect?.style.display).toBe('none');
            expect(mockElements.toolbarFontSelect?.style.position).toBe('fixed');
        });
    });

    describe('font selection', () => {
        beforeEach(async () => {
            await fontHandler.initialize();
        });

        it('should update font button state based on selection', () => {
            // Create a selection
            const p = document.querySelector('p');
            if (!p) throw new Error('Paragraph not found');
            
            p.style.fontFamily = 'Arial';
            const range = document.createRange();
            range.selectNodeContents(p);
            
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);

            // Trigger selection change
            document.dispatchEvent(new Event('selectionchange'));

            const fontNameElement = mockElements.fontButton?.querySelector('.font-name');
            expect(fontNameElement?.textContent).toBe('Arial');
            expect((fontNameElement as HTMLElement)?.style.fontFamily).toBe('Arial');
        });

        it('should handle system fonts correctly', () => {
            const p = document.querySelector('p');
            if (!p) throw new Error('Paragraph not found');
            
            p.style.fontFamily = '-apple-system, BlinkMacSystemFont';
            const range = document.createRange();
            range.selectNodeContents(p);
            
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);

            document.dispatchEvent(new Event('selectionchange'));

            const fontNameElement = mockElements.fontButton?.querySelector('.font-name');
            expect(fontNameElement?.textContent).toBe('-apple-system');
            expect((fontNameElement as HTMLElement)?.style.fontFamily).toBe('-apple-system');
        });

        it('should handle mixed fonts correctly', () => {
            const p = document.querySelector('p');
            if (!p) throw new Error('Paragraph not found');
            
            p.innerHTML = '<span style="font-family: Arial">Text 1</span><span style="font-family: Times New Roman">Text 2</span>';
            const range = document.createRange();
            range.selectNodeContents(p);
            
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);

            document.dispatchEvent(new Event('selectionchange'));

            const fontNameElement = mockElements.fontButton?.querySelector('.font-name');
            expect(fontNameElement?.textContent).toBe('Arial');
            expect((fontNameElement as HTMLElement)?.style.fontFamily).toBe('Arial');
        });
    });

    describe('font dropdown', () => {
        beforeEach(async () => {
            await fontHandler.initialize();
        });

        it('should show font dropdown when clicking font button', () => {
            mockElements.fontButton?.click();
            expect(mockElements.toolbarFontSelect?.style.display).toBe('block');
            expect(mockElements.toolbarFontSelect?.style.visibility).toBe('visible');
            expect(mockElements.toolbarFontSelect?.style.opacity).toBe('0');
            
            // Wait for requestAnimationFrame
            jest.runAllTimers();
            expect(mockElements.toolbarFontSelect?.classList.contains('active')).toBe(true);
            expect(mockElements.toolbarFontSelect?.style.opacity).toBe('1');
        });

        it('should hide font dropdown when clicking outside', () => {
            // Show dropdown
            mockElements.fontButton?.click();
            
            // Click outside
            document.body.click();
            
            expect(mockElements.toolbarFontSelect?.classList.contains('active')).toBe(false);
            setTimeout(() => {
                expect(mockElements.toolbarFontSelect?.style.display).toBe('none');
            }, 200);
        });

        it('should contain both system and Google fonts', async () => {
            await fontHandler.initialize();
            mockElements.fontButton?.click();

            // Check for at least one system font
            const systemFontItem = mockElements.toolbarFontSelect?.querySelector(`[style*="font-family: Arial"]`);
            expect(systemFontItem).toBeTruthy();

            // Check for at least one Google font
            const googleFontItem = mockElements.toolbarFontSelect?.querySelector(`[style*="font-family: Libre Baskerville"]`);
            expect(googleFontItem).toBeTruthy();
        });
    });

    describe('cleanup', () => {
        beforeEach(async () => {
            await fontHandler.initialize();
        });

        it('should remove event listeners and dropdown on cleanup', () => {
            fontHandler.cleanup();
            expect(mockElements.toolbarFontSelect?.parentNode).toBeNull();
            
            // Verify event listeners are removed by checking if actions still work
            mockElements.fontButton?.click();
            expect(mockElements.toolbarFontSelect?.style.display).not.toBe('block');
        });
    });
}); 