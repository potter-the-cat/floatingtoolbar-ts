import { handlePaste } from '../../../../src/handlers/selection';
import { ToolbarConfig, ToolbarState, ToolbarElements } from '../../../../src/core/types';

/**
 * This test suite tests the paste handler functionality in isolation.
 * It mocks the necessary context and clipboard events to verify that:
 * 1. The default paste behavior is prevented
 * 2. HTML content is properly extracted from the clipboard
 * 3. Plain text is used as a fallback when HTML is not available
 * 4. The toolbar state is updated after pasting
 */

// Mock the SelectionHandlerContext with all required properties
const mockContext = {
  config: {
    container: '.container',
    content: '#editor',
    selector: '#editor',
    mode: 'floating' as const,
    theme: 'dark' as const,
    debug: true,
    useExistingToolbar: false,
    buttons: {
      text: { bold: true }
    },
    offset: { x: 0, y: 0 },
    persistentPosition: { top: 0, center: true },
    toolbarId: 'test-toolbar',
    resizeDebounceMs: 100
  } as ToolbarConfig,
  state: {
    isVisible: true,
    isPersistent: false,
    isAtPersistentPosition: false,
    currentView: 'initial' as const,
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
    positionObserver: null
  } as ToolbarState,
  elements: {} as ToolbarElements,
  debug: jest.fn(),
  updateView: jest.fn(),
  updateFormatButtonStates: jest.fn(),
  clearFormatButtonStates: jest.fn(),
  checkForExistingLink: jest.fn()
};

describe('Paste Handler', () => {
  let container: HTMLElement;
  
  beforeEach(() => {
    // Set up a test container with contenteditable attribute
    container = document.createElement('div');
    container.id = 'editor';
    container.setAttribute('contenteditable', 'true');
    document.body.appendChild(container);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    // Clean up the DOM after each test
    document.body.removeChild(container);
  });
  
  describe('handlePaste', () => {
    it('should prevent default paste behavior', () => {
      // Create a mock clipboard event with preventDefault spy
      const mockEvent = {
        preventDefault: jest.fn(),
        clipboardData: {
          getData: jest.fn().mockReturnValue('test text')
        }
      } as unknown as ClipboardEvent;
      
      // Call handlePaste with the mock context and event
      handlePaste.call(mockContext, mockEvent);
      
      // Verify that preventDefault was called to stop default paste behavior
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
    
    it('should get HTML content from clipboard if available', () => {
      // Create a mock clipboard event with both HTML and plain text content
      const mockEvent = {
        preventDefault: jest.fn(),
        clipboardData: {
          getData: jest.fn((type) => {
            if (type === 'text/html') return '<p>test <strong>html</strong></p>';
            if (type === 'text/plain') return 'test text';
            return '';
          })
        }
      } as unknown as ClipboardEvent;
      
      // Mock document.execCommand since we can't test actual DOM manipulation in Jest
      document.execCommand = jest.fn();
      
      // Call handlePaste with the mock context and event
      handlePaste.call(mockContext, mockEvent);
      
      // Verify that getData was called with 'text/html' to get formatted content
      expect(mockEvent.clipboardData?.getData).toHaveBeenCalledWith('text/html');
    });
    
    it('should fall back to plain text if HTML is not available', () => {
      // Create a mock clipboard event with only plain text (no HTML)
      const mockEvent = {
        preventDefault: jest.fn(),
        clipboardData: {
          getData: jest.fn((type) => {
            if (type === 'text/html') return '';
            if (type === 'text/plain') return 'test text';
            return '';
          })
        }
      } as unknown as ClipboardEvent;
      
      // Mock document.execCommand since we can't test actual DOM manipulation in Jest
      document.execCommand = jest.fn();
      
      // Call handlePaste with the mock context and event
      handlePaste.call(mockContext, mockEvent);
      
      // Verify that execCommand was called with 'insertText' and the plain text
      expect(document.execCommand).toHaveBeenCalledWith('insertText', false, 'test text');
    });
    
    it('should update toolbar state after pasting', () => {
      // Create a mock clipboard event
      const mockEvent = {
        preventDefault: jest.fn(),
        clipboardData: {
          getData: jest.fn().mockReturnValue('test text')
        }
      } as unknown as ClipboardEvent;
      
      // Mock document.execCommand since we can't test actual DOM manipulation in Jest
      document.execCommand = jest.fn();
      
      // Call handlePaste with the mock context and event
      handlePaste.call(mockContext, mockEvent);
      
      // Verify that the toolbar state is updated after pasting
      expect(mockContext.updateFormatButtonStates).toHaveBeenCalled();
      expect(mockContext.updateView).toHaveBeenCalled();
    });
  });
  
  // Since the helper functions are not exported, we can't test them directly
  // We'll test their functionality through the handlePaste function
}); 