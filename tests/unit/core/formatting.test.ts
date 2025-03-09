import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { handleDropCap, updateFormatButtonStates } from '@/handlers/formatting';

describe('Drop Cap Formatting', () => {
    let mockContext: any;
    let mockParagraph: HTMLParagraphElement;
    let mockSelection: any;
    let mockRange: any;

    beforeEach(() => {
        // Create mock paragraph
        mockParagraph = document.createElement('p');
        mockParagraph.textContent = 'Test paragraph';
        document.body.appendChild(mockParagraph);

        // Create mock range and selection
        mockRange = {
            commonAncestorContainer: mockParagraph.firstChild,
            getBoundingClientRect: () => ({ top: 0, left: 0, width: 100, height: 20 })
        };

        mockSelection = {
            getRangeAt: () => mockRange,
            removeAllRanges: jest.fn(),
            addRange: jest.fn(),
            rangeCount: 1
        };

        // Mock window.getSelection
        global.getSelection = () => mockSelection;

        // Create mock context
        mockContext = {
            state: {
                selectionRange: mockRange,
                activeFormats: new Set()
            },
            elements: {
                dropCapButton: document.createElement('button')
            },
            debug: jest.fn(),
            updateView: jest.fn()
        };
    });

    test('handleDropCap adds drop-cap class to paragraph', () => {
        // Call handleDropCap
        handleDropCap.call(mockContext);

        // Check if class was added
        expect(mockParagraph.classList.contains('drop-cap')).toBe(true);
    });

    test('handleDropCap removes drop-cap class when already present', () => {
        // Add drop-cap class first
        mockParagraph.classList.add('drop-cap');

        // Call handleDropCap
        handleDropCap.call(mockContext);

        // Check if class was removed
        expect(mockParagraph.classList.contains('drop-cap')).toBe(false);
    });

    test('updateFormatButtonStates correctly detects drop cap', () => {
        // Add drop-cap class to paragraph
        mockParagraph.classList.add('drop-cap');

        // Call updateFormatButtonStates
        updateFormatButtonStates.call(mockContext);

        // Check if button was activated
        expect(mockContext.elements.dropCapButton.classList.contains('active')).toBe(true);
    });

    test('updateFormatButtonStates correctly detects no drop cap', () => {
        // Call updateFormatButtonStates without drop-cap class
        updateFormatButtonStates.call(mockContext);

        // Check if button was not activated
        expect(mockContext.elements.dropCapButton.classList.contains('active')).toBe(false);
    });

    test('handleDropCap does nothing when no paragraph is found', () => {
        // Create a non-paragraph element
        const div = document.createElement('div');
        div.textContent = 'Test div';
        document.body.appendChild(div);

        // Update mock range to use div
        mockRange.commonAncestorContainer = div.firstChild;

        // Call handleDropCap
        handleDropCap.call(mockContext);

        // Check that no classes were added to div
        expect(div.classList.contains('drop-cap')).toBe(false);
    });

    test('updateFormatButtonStates handles missing dropCapButton gracefully', () => {
        // Remove dropCapButton from context
        mockContext.elements.dropCapButton = null;

        // This should not throw an error
        expect(() => {
            updateFormatButtonStates.call(mockContext);
        }).not.toThrow();
    });

    // Clean up after each test
    afterEach(() => {
        document.body.innerHTML = '';
    });
});