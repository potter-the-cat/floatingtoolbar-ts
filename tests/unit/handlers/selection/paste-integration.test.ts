import { FloatingToolbar } from '../../../../src/core/FloatingToolbar';
import { ButtonConfig } from '../../../../src/core/types';
import { handlePaste } from '../../../../src/handlers/selection';
import { ToolbarConfig, ToolbarState, ToolbarElements } from '../../../../src/core/types';

/**
 * Integration tests for the paste handler functionality.
 * 
 * These tests simulate real-world paste scenarios with different content types:
 * 1. HTML content with various formatting
 * 2. Plain text content
 * 3. Content from Google Docs with its specific formatting
 * 4. Content from Microsoft Word with its specific formatting
 * 
 * Unlike the unit tests, these tests focus on the end-to-end behavior
 * of the paste handler, including HTML sanitization and format mapping.
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

/**
 * Helper function to create a mock clipboard event with specified HTML and plain text content.
 * This allows us to simulate different types of clipboard data in our tests.
 */
function createMockClipboardEvent(html: string, text: string): ClipboardEvent {
  return {
    preventDefault: jest.fn(),
    clipboardData: {
      getData: jest.fn((type) => {
        if (type === 'text/html') return html;
        if (type === 'text/plain') return text;
        return '';
      })
    }
  } as unknown as ClipboardEvent;
}

/**
 * Helper function to set up the test environment with a contenteditable container
 * and return the container element for assertions.
 */
function setupTestEnvironment(): HTMLElement {
  const container = document.createElement('div');
  container.id = 'editor';
  container.setAttribute('contenteditable', 'true');
  document.body.appendChild(container);
  return container;
}

/**
 * Helper function to clean up the test environment by removing the container.
 */
function cleanupTestEnvironment(container: HTMLElement): void {
  document.body.removeChild(container);
}

describe('Paste Handler Integration Tests', () => {
  let container: HTMLElement;
  
  beforeEach(() => {
    // Set up the test environment before each test
    container = setupTestEnvironment();
    jest.clearAllMocks();
    
    // Mock the execCommand to actually insert content for integration testing
    document.execCommand = jest.fn((command, showUI, value) => {
      if (command === 'insertHTML' && value) {
        container.innerHTML = value;
        return true;
      }
      if (command === 'insertText' && value) {
        container.textContent = value;
        return true;
      }
      return false;
    });
  });
  
  afterEach(() => {
    // Clean up the test environment after each test
    cleanupTestEnvironment(container);
  });
  
  it('should handle HTML content correctly', () => {
    // Test with standard HTML content containing various formatting elements
    const htmlContent = '<p>This is <strong>bold</strong> and <em>italic</em> text with a <a href="https://example.com">link</a>.</p>';
    const plainText = 'This is bold and italic text with a link.';
    
    // Create a mock clipboard event with the test content
    const mockEvent = createMockClipboardEvent(htmlContent, plainText);
    
    // Call handlePaste with the mock context and event
    handlePaste.call(mockContext, mockEvent);
    
    // Verify that the HTML was processed and inserted correctly
    // Note: The exact output may vary based on the sanitization and formatting rules
    expect(container.innerHTML).toContain('<strong>bold</strong>');
    expect(container.innerHTML).toContain('<em>italic</em>');
    expect(container.innerHTML).toContain('<a href="https://example.com">link</a>');
  });
  
  it('should handle plain text content correctly', () => {
    // Test with plain text content only (no HTML)
    const plainText = 'This is plain text without any formatting.';
    
    // Create a mock clipboard event with empty HTML and only plain text
    const mockEvent = createMockClipboardEvent('', plainText);
    
    // Call handlePaste with the mock context and event
    handlePaste.call(mockContext, mockEvent);
    
    // Verify that the plain text was inserted correctly
    expect(container.textContent).toBe(plainText);
  });
  
  it('should handle Google Docs content correctly', () => {
    // Test with content that simulates a paste from Google Docs
    // Google Docs uses specific span elements with style attributes
    const googleDocsHtml = `
      <meta charset='utf-8'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-abc123"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">This is bold text from Google Docs</span></b>
    `;
    const plainText = 'This is bold text from Google Docs';
    
    // Create a mock clipboard event with the Google Docs content
    const mockEvent = createMockClipboardEvent(googleDocsHtml, plainText);
    
    // Call handlePaste with the mock context and event
    handlePaste.call(mockContext, mockEvent);
    
    // Verify that the Google Docs formatting was properly mapped to standard HTML
    // The mapExternalFormatting function should convert Google Docs styles to standard HTML elements
    expect(container.innerHTML).toContain('<strong>');
    expect(container.innerHTML).toContain('This is bold text from Google Docs');
    
    // Verify that Google Docs specific elements were removed
    expect(container.innerHTML).not.toContain('docs-internal-guid');
  });
  
  it('should handle Microsoft Word content correctly', () => {
    // Test with content that simulates a paste from Microsoft Word
    // Word uses specific elements and classes for formatting
    const wordHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
        <head>
          <meta charset="utf-8">
          <meta name=Generator content="Microsoft Word 15">
        </head>
        <body>
          <p class=MsoNormal><span style='mso-bidi-font-weight:bold'>This is bold text from Word</span></p>
        </body>
      </html>
    `;
    const plainText = 'This is bold text from Word';
    
    // Create a mock clipboard event with the Word content
    const mockEvent = createMockClipboardEvent(wordHtml, plainText);
    
    // Call handlePaste with the mock context and event
    handlePaste.call(mockContext, mockEvent);
    
    // Verify that the Word formatting was properly mapped to standard HTML
    // The mapExternalFormatting function should convert Word styles to standard HTML elements
    expect(container.innerHTML).toContain('This is bold text from Word');
    
    // Verify that Word specific elements and classes were removed
    expect(container.innerHTML).not.toContain('MsoNormal');
    expect(container.innerHTML).not.toContain('xmlns:o');
  });
}); 