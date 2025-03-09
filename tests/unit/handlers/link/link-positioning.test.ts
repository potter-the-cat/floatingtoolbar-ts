import { ToolbarConfig, ToolbarState, ToolbarElements } from '../../../../src/core/types';
import { handleSelection } from '../../../../src/handlers/selection';
import { handleLinkButtonClick, handleSaveLinkClick } from '../../../../src/handlers/link';

declare global {
    interface Window {
        ensureValidUrl: (url: string) => string;
    }
}

describe('Link Toolbar Positioning', () => {
    let mockState: ToolbarState;
    let mockElements: ToolbarElements;
    let mockConfig: ToolbarConfig;
    let mockContext: any;

    beforeEach(() => {
        // Mock DOM elements
        const toolbar = document.createElement('div');
        const linkInput = document.createElement('input');
        const toolbarInitial = document.createElement('div');
        const toolbarLinkInput = document.createElement('div');
        const toolbarFontSelect = document.createElement('div');
        const container = document.createElement('div');
        const contentArea = document.createElement('div');
        contentArea.id = 'content';
        document.body.appendChild(contentArea);
        
        // Create complete mock elements with all required properties
        mockElements = {
            toolbar,
            container,
            toolbarInitial,
            toolbarLinkInput,
            toolbarFontSelect,
            linkButton: document.createElement('button'),
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
            fontButton: document.createElement('button'),
            fontList: document.createElement('div'),
            linkInput,
            buttons: {
                bold: { element: document.createElement('button'), enabled: true },
                italic: { element: document.createElement('button'), enabled: true },
                underline: { element: document.createElement('button'), enabled: true },
                strikethrough: { element: document.createElement('button'), enabled: true },
                subscript: { element: document.createElement('button'), enabled: true },
                superscript: { element: document.createElement('button'), enabled: true },
                h1: { element: document.createElement('button'), enabled: true },
                h2: { element: document.createElement('button'), enabled: true },
                dropCap: { element: document.createElement('button'), enabled: true },
                code: { element: document.createElement('button'), enabled: true },
                quote: { element: document.createElement('button'), enabled: true },
                hr: { element: document.createElement('button'), enabled: true },
                bulletList: { element: document.createElement('button'), enabled: true },
                numberList: { element: document.createElement('button'), enabled: true },
                font: { element: document.createElement('button'), enabled: true }
            }
        };

        mockState = {
            isVisible: true,
            isPersistent: true,
            isAtPersistentPosition: true,
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
            dropCapElements: new Set()
        };

        mockConfig = {
            container: '#editor',
            content: '#content',
            mode: 'persistent',
            theme: 'light',
            debug: false,
            useExistingToolbar: false,
            buttons: {
                text: {},
                script: {},
                heading: {},
                special: {},
                list: {},
                link: {}
            },
            offset: { x: 0, y: 10 },
            persistentPosition: { top: 0 },
            toolbarId: 'test-toolbar',
            resizeDebounceMs: 100
        };

        mockContext = {
            config: mockConfig,
            state: mockState,
            elements: mockElements,
            debug: jest.fn(),
            updateView: jest.fn(),
            updateFormatButtonStates: jest.fn(),
            clearFormatButtonStates: jest.fn(),
            checkForExistingLink: jest.fn(),
        };

        // Setup document.body for tests
        document.body.innerHTML = '';
        document.body.appendChild(contentArea);
        document.body.appendChild(toolbar);
    });

    test('maintains position when creating new link', () => {
        // Setup initial position
        mockElements.toolbar!.style.top = '100px';
        mockElements.toolbar!.style.left = '200px';
        
        // Create a proper MouseEvent
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        
        // Call link button click handler
        handleLinkButtonClick.call(mockContext, clickEvent);
        
        // Verify position is maintained
        expect(mockElements.toolbar!.style.top).toBe('100px');
        expect(mockElements.toolbar!.style.left).toBe('200px');
        expect(mockState.currentView).toBe('linkInput');
        expect(mockState.isVisible).toBe(true);
    });

    test('moves to selection when editing existing link', () => {
        // Setup mock selection
        const mockRange = {
            getBoundingClientRect: () => ({
                top: 150,
                left: 250,
                width: 100,
                height: 20,
                bottom: 170,
                right: 350,
            }),
            commonAncestorContainer: document.querySelector('#content'),
            cloneRange: () => mockRange,
        };

        const mockSelection = {
            toString: () => 'Example Link',
            getRangeAt: () => mockRange,
            rangeCount: 1,
        };

        // Mock window.getSelection
        const originalGetSelection = window.getSelection;
        window.getSelection = () => mockSelection as unknown as Selection;

        // Mock existing link
        const existingLink = document.createElement('a');
        existingLink.href = 'https://example.com';
        mockContext.checkForExistingLink.mockReturnValue(existingLink);

        // Create a proper MouseEvent
        const mouseEvent = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: 250,
            clientY: 150
        });
        
        // Call selection handler
        handleSelection.call(mockContext, mouseEvent);

        // Verify toolbar state and position
        expect(mockState.currentView).toBe('linkInput');
        expect(mockState.existingLink).toBe(existingLink);
        expect(mockState.isAtPersistentPosition).toBe(false);
        expect(mockElements.toolbar!.classList.contains('following-selection')).toBe(true);
        expect(mockElements.toolbar!.classList.contains('persistent-position')).toBe(false);

        // Restore original getSelection
        window.getSelection = originalGetSelection;
    });

    test('resets to fixed position after saving link', () => {
        // Setup mock selection and link state
        mockState.currentView = 'linkInput';
        mockState.isAtPersistentPosition = false;
        mockElements.toolbar!.classList.add('following-selection');
        mockElements.toolbar!.classList.remove('persistent-position');
        mockElements.linkInput!.value = 'https://example.com';
        mockState.selectedText = 'Example Link';

        // Create a proper DOM environment
        const contentArea = document.createElement('div');
        contentArea.id = 'content';
        document.body.appendChild(contentArea);

        const textNode = document.createTextNode('Example Link');
        contentArea.appendChild(textNode);

        const range = document.createRange();
        range.selectNode(textNode);
        mockState.selectionRange = range;

        // Mock empty selection
        const mockSelection = {
            toString: () => '',
            getRangeAt: () => null,
            rangeCount: 0,
            removeAllRanges: () => {},
        };

        // Mock window.getSelection
        const originalGetSelection = window.getSelection;
        window.getSelection = () => mockSelection as unknown as Selection;

        // Mock window.ensureValidUrl
        const originalEnsureValidUrl = window.ensureValidUrl;
        window.ensureValidUrl = (url: string) => url;

        // Create a proper MouseEvent
        const mouseEvent = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: 0,
            clientY: 0
        });
        
        // Simulate saving link
        handleSaveLinkClick.call(mockContext, mouseEvent);

        // Verify toolbar resets to fixed position
        expect(mockState.isAtPersistentPosition).toBe(true);
        expect(mockElements.toolbar!.classList.contains('persistent-position')).toBe(true);
        expect(mockElements.toolbar!.classList.contains('following-selection')).toBe(false);

        // Restore original functions
        window.getSelection = originalGetSelection;
        window.ensureValidUrl = originalEnsureValidUrl;

        // Clean up
        document.body.removeChild(contentArea);
    });

    test('preserves position during link input interaction', () => {
        // Setup initial position
        mockElements.toolbar!.style.top = '100px';
        mockElements.toolbar!.style.left = '200px';
        mockState.currentView = 'linkInput';
        mockState.isAtPersistentPosition = false;

        // Create a proper MouseEvent with the link input as target
        const mouseEvent = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: 0,
            clientY: 0
        });
        Object.defineProperty(mouseEvent, 'target', { value: mockElements.linkInput });
        
        // Simulate clicking inside the link input
        handleSelection.call(mockContext, mouseEvent);

        // Verify position is maintained
        expect(mockElements.toolbar!.style.top).toBe('100px');
        expect(mockElements.toolbar!.style.left).toBe('200px');
        expect(mockState.currentView).toBe('linkInput');
    });
}); 