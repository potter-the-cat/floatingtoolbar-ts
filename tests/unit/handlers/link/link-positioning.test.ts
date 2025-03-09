import { ToolbarConfig, ToolbarState, ToolbarElements } from '../../src/core/types';
import { handleSelection } from '../../src/handlers/selection';
import { handleLinkButtonClick } from '../../src/handlers/link';

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
        
        // Create complete mock elements with all required properties
        mockElements = {
            toolbar,
            linkInput,
            toolbarInitial,
            toolbarLinkInput,
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
            numberListButton: document.createElement('button')
        };

        mockState = {
            isFixed: true,
            isVisible: true,
            currentView: 'initial',
            currentSelection: null,
            selectedText: '',
            selectionRange: null,
            position: { x: 0, y: 0 },
            selectionRect: null,
            existingLink: null,
            resizeTimeout: null,
            activeFormats: new Set(),
            dropCapElements: new Set(),
            isProcessingLinkClick: false,
            isAtFixedPosition: true
        };

        mockConfig = {
            mode: 'fixed',
            offset: { x: 0, y: 10 },
            debug: false,
        } as ToolbarConfig;

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
            commonAncestorContainer: document.body,
            cloneRange: () => mockRange,
        };

        const mockSelection = {
            toString: () => 'Example Link',
            getRangeAt: () => mockRange,
            rangeCount: 1,
        };

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
        expect(mockState.isAtFixedPosition).toBe(false);
        expect(mockElements.toolbar!.classList.contains('following-selection')).toBe(true);
        expect(mockElements.toolbar!.classList.contains('fixed-position')).toBe(false);
    });

    test('resets to fixed position after saving link', () => {
        // Setup mock selection and link state
        mockState.currentView = 'linkInput';
        mockState.isAtFixedPosition = false;
        mockElements.toolbar!.classList.add('following-selection');
        mockElements.toolbar!.classList.remove('fixed-position');

        // Create a proper MouseEvent
        const mouseEvent = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: 0,
            clientY: 0
        });
        
        // Simulate saving link (clearing selection)
        handleSelection.call(mockContext, mouseEvent);

        // Verify toolbar resets to fixed position
        expect(mockState.isAtFixedPosition).toBe(true);
        expect(mockElements.toolbar!.classList.contains('fixed-position')).toBe(true);
        expect(mockElements.toolbar!.classList.contains('following-selection')).toBe(false);
    });

    test('preserves position during link input interaction', () => {
        // Setup initial position
        mockElements.toolbar!.style.top = '100px';
        mockElements.toolbar!.style.left = '200px';
        mockState.currentView = 'linkInput';
        mockState.isAtFixedPosition = false;

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