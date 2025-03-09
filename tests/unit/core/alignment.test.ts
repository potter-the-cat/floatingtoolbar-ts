import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { handleFormat, updateFormatButtonStates } from '@/handlers/formatting';
import { FormatType } from '@/core/types';

describe('Text Alignment Formatting', () => {
    let mockContext: any;
    let mockParagraph: HTMLParagraphElement;
    let mockSelection: any;
    let mockRange: any;
    let execCommandMock: jest.Mock;
    let queryCommandStateMock: jest.Mock;

    beforeEach(() => {
        // Create mock paragraph
        mockParagraph = document.createElement('p');
        mockParagraph.textContent = 'Test paragraph for alignment';
        document.body.appendChild(mockParagraph);

        // Create mock range and selection
        mockRange = {
            commonAncestorContainer: mockParagraph.firstChild,
            getBoundingClientRect: () => ({ top: 0, left: 0, width: 100, height: 20 }),
            cloneRange: () => mockRange
        };

        mockSelection = {
            getRangeAt: () => mockRange,
            removeAllRanges: jest.fn(),
            addRange: jest.fn(),
            rangeCount: 1
        };

        // Mock window.getSelection
        global.getSelection = () => mockSelection;

        // Mock document.execCommand
        execCommandMock = jest.fn().mockReturnValue(true);
        document.execCommand = execCommandMock as unknown as typeof document.execCommand;

        // Mock document.queryCommandState
        queryCommandStateMock = jest.fn().mockImplementation((command) => {
            switch (command) {
                case 'justifyLeft':
                    return command === 'justifyLeft';
                case 'justifyCenter':
                    return command === 'justifyCenter';
                case 'justifyRight':
                    return command === 'justifyRight';
                case 'justifyFull':
                    return command === 'justifyFull';
                default:
                    return false;
            }
        });
        document.queryCommandState = queryCommandStateMock as unknown as typeof document.queryCommandState;

        // Create mock context
        mockContext = {
            state: {
                selectionRange: mockRange,
                activeFormats: new Set(),
                isVisible: false
            },
            elements: {
                alignLeftButton: document.createElement('button'),
                alignCenterButton: document.createElement('button'),
                alignRightButton: document.createElement('button'),
                alignJustifyButton: document.createElement('button')
            },
            debug: jest.fn(),
            updateView: jest.fn(),
            updatePosition: jest.fn()
        };
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });

    test('handleFormat calls execCommand with justifyLeft for alignLeft', () => {
        // Call handleFormat with alignLeft
        handleFormat.call(mockContext, 'alignLeft' as FormatType);

        // Check if execCommand was called with the correct command
        expect(execCommandMock).toHaveBeenCalledWith('justifyLeft', false, '');
    });

    test('handleFormat calls execCommand with justifyCenter for alignCenter', () => {
        // Call handleFormat with alignCenter
        handleFormat.call(mockContext, 'alignCenter' as FormatType);

        // Check if execCommand was called with the correct command
        expect(execCommandMock).toHaveBeenCalledWith('justifyCenter', false, '');
    });

    test('handleFormat calls execCommand with justifyRight for alignRight', () => {
        // Call handleFormat with alignRight
        handleFormat.call(mockContext, 'alignRight' as FormatType);

        // Check if execCommand was called with the correct command
        expect(execCommandMock).toHaveBeenCalledWith('justifyRight', false, '');
    });

    test('handleFormat calls execCommand with justifyFull for alignJustify', () => {
        // Call handleFormat with alignJustify
        handleFormat.call(mockContext, 'alignJustify' as FormatType);

        // Check if execCommand was called with the correct command
        expect(execCommandMock).toHaveBeenCalledWith('justifyFull', false, '');
    });

    test('updateFormatButtonStates correctly detects left alignment', () => {
        // Mock queryCommandState to return true for justifyLeft
        queryCommandStateMock.mockImplementation((command) => command === 'justifyLeft');

        // Call updateFormatButtonStates
        updateFormatButtonStates.call(mockContext);

        // Check if the correct button was activated
        expect(mockContext.elements.alignLeftButton.classList.contains('active')).toBe(true);
        expect(mockContext.elements.alignCenterButton.classList.contains('active')).toBe(false);
        expect(mockContext.elements.alignRightButton.classList.contains('active')).toBe(false);
        expect(mockContext.elements.alignJustifyButton.classList.contains('active')).toBe(false);
    });

    test('updateFormatButtonStates correctly detects center alignment', () => {
        // Mock queryCommandState to return true for justifyCenter
        queryCommandStateMock.mockImplementation((command) => command === 'justifyCenter');

        // Call updateFormatButtonStates
        updateFormatButtonStates.call(mockContext);

        // Check if the correct button was activated
        expect(mockContext.elements.alignLeftButton.classList.contains('active')).toBe(false);
        expect(mockContext.elements.alignCenterButton.classList.contains('active')).toBe(true);
        expect(mockContext.elements.alignRightButton.classList.contains('active')).toBe(false);
        expect(mockContext.elements.alignJustifyButton.classList.contains('active')).toBe(false);
    });

    test('updateFormatButtonStates correctly detects right alignment', () => {
        // Mock queryCommandState to return true for justifyRight
        queryCommandStateMock.mockImplementation((command) => command === 'justifyRight');

        // Call updateFormatButtonStates
        updateFormatButtonStates.call(mockContext);

        // Check if the correct button was activated
        expect(mockContext.elements.alignLeftButton.classList.contains('active')).toBe(false);
        expect(mockContext.elements.alignCenterButton.classList.contains('active')).toBe(false);
        expect(mockContext.elements.alignRightButton.classList.contains('active')).toBe(true);
        expect(mockContext.elements.alignJustifyButton.classList.contains('active')).toBe(false);
    });

    test('updateFormatButtonStates correctly detects justify alignment', () => {
        // Mock queryCommandState to return true for justifyFull
        queryCommandStateMock.mockImplementation((command) => command === 'justifyFull');

        // Call updateFormatButtonStates
        updateFormatButtonStates.call(mockContext);

        // Check if the correct button was activated
        expect(mockContext.elements.alignLeftButton.classList.contains('active')).toBe(false);
        expect(mockContext.elements.alignCenterButton.classList.contains('active')).toBe(false);
        expect(mockContext.elements.alignRightButton.classList.contains('active')).toBe(false);
        expect(mockContext.elements.alignJustifyButton.classList.contains('active')).toBe(true);
    });

    test('updateFormatButtonStates handles missing alignment buttons gracefully', () => {
        // Remove alignment buttons from context
        mockContext.elements.alignLeftButton = null;
        mockContext.elements.alignCenterButton = null;
        mockContext.elements.alignRightButton = null;
        mockContext.elements.alignJustifyButton = null;

        // This should not throw an error
        expect(() => {
            updateFormatButtonStates.call(mockContext);
        }).not.toThrow();
    });

    test('handleFormat updates toolbar visibility and position', () => {
        // Call handleFormat with alignLeft
        handleFormat.call(mockContext, 'alignLeft' as FormatType);

        // Check if toolbar visibility was updated
        expect(mockContext.state.isVisible).toBe(true);
        
        // Check if updateView was called
        expect(mockContext.updateView).toHaveBeenCalled();
    });

    test('handleFormat stores the updated selection range', () => {
        // Call handleFormat with alignCenter
        handleFormat.call(mockContext, 'alignCenter' as FormatType);

        // Check if selection range was updated
        expect(mockContext.state.selectionRange).toBe(mockRange);
    });

    test('handleFormat does nothing when no selection range exists', () => {
        // Remove selection range
        mockContext.state.selectionRange = null;

        // Call handleFormat with alignRight
        handleFormat.call(mockContext, 'alignRight' as FormatType);

        // Check that execCommand was not called
        expect(execCommandMock).not.toHaveBeenCalled();
    });
}); 