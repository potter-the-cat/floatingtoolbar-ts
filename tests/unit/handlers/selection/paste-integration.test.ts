import { FloatingToolbar } from '../../../../src/core/FloatingToolbar';
import { ButtonConfig } from '../../../../src/core/types';

describe('Paste Integration Tests', () => {
  let container: HTMLElement;
  let editor: HTMLElement;
  let toolbar: FloatingToolbar;
  
  beforeEach(() => {
    // Set up the DOM
    container = document.createElement('div');
    container.className = 'content-wrapper';
    
    editor = document.createElement('div');
    editor.id = 'editor';
    editor.className = 'content';
    editor.setAttribute('contenteditable', 'true');
    
    container.appendChild(editor);
    document.body.appendChild(container);
    
    // Initialize the toolbar with complete button config
    const buttons: ButtonConfig = {
      text: {
        bold: true,
        italic: true,
        underline: true,
        strikethrough: true
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
      },
      font: {
        enabled: false
      },
      alignment: {
        left: false,
        center: false,
        right: false,
        justify: false
      }
    };
    
    // Initialize the toolbar
    toolbar = new FloatingToolbar({
      container: '.content-wrapper',
      content: '.content',
      mode: 'floating',
      theme: 'dark',
      debug: false,
      useExistingToolbar: false,
      buttons,
      offset: { x: 0, y: 0 },
      persistentPosition: { top: 0, center: true },
      toolbarId: 'test-toolbar',
      resizeDebounceMs: 100
    });
    
    // Mock document.execCommand
    document.execCommand = jest.fn();
  });
  
  afterEach(() => {
    // Clean up
    document.body.removeChild(container);
    jest.clearAllMocks();
  });
  
  it('should handle pasting HTML content', () => {
    // Create a paste event with HTML content
    const pasteEvent = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent;
    Object.defineProperty(pasteEvent, 'clipboardData', {
      value: {
        getData: jest.fn((type) => {
          if (type === 'text/html') return '<p>test <strong>html</strong></p>';
          if (type === 'text/plain') return 'test html';
          return '';
        })
      }
    });
    
    // Dispatch the paste event
    editor.dispatchEvent(pasteEvent);
    
    // Check if preventDefault was called (via the mock)
    expect(pasteEvent.defaultPrevented).toBe(true);
  });
  
  it('should handle pasting plain text when HTML is not available', () => {
    // Create a paste event with only plain text
    const pasteEvent = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent;
    Object.defineProperty(pasteEvent, 'clipboardData', {
      value: {
        getData: jest.fn((type) => {
          if (type === 'text/html') return '';
          if (type === 'text/plain') return 'plain text';
          return '';
        })
      }
    });
    
    // Dispatch the paste event
    editor.dispatchEvent(pasteEvent);
    
    // Check if preventDefault was called
    expect(pasteEvent.defaultPrevented).toBe(true);
    
    // Check if execCommand was called with the plain text
    expect(document.execCommand).toHaveBeenCalledWith('insertText', false, 'plain text');
  });
  
  it('should handle pasting content from Google Docs', () => {
    // Create a paste event with Google Docs style HTML
    const googleDocsHtml = `
      <meta charset='utf-8'><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Bold text</span>
      <span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Italic text</span>
    `;
    
    const pasteEvent = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent;
    Object.defineProperty(pasteEvent, 'clipboardData', {
      value: {
        getData: jest.fn((type) => {
          if (type === 'text/html') return googleDocsHtml;
          if (type === 'text/plain') return 'Bold text Italic text';
          return '';
        })
      }
    });
    
    // Dispatch the paste event
    editor.dispatchEvent(pasteEvent);
    
    // Check if preventDefault was called
    expect(pasteEvent.defaultPrevented).toBe(true);
  });
  
  it('should handle pasting content from Microsoft Word', () => {
    // Create a paste event with Word style HTML
    const wordHtml = `
      <meta charset='utf-8'><p class=MsoNormal><span style='font-family:"Calibri",sans-serif;
      mso-ascii-theme-font:minor-latin;mso-hansi-theme-font:minor-latin;mso-bidi-theme-font:
      minor-latin;font-weight:bold;mso-bidi-font-weight:normal'>Bold text</span></p>
      <p class=MsoNormal><span style='font-family:"Calibri",sans-serif;mso-ascii-theme-font:
      minor-latin;mso-hansi-theme-font:minor-latin;mso-bidi-theme-font:minor-latin;
      font-style:italic;mso-bidi-font-style:normal'>Italic text</span></p>
    `;
    
    const pasteEvent = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent;
    Object.defineProperty(pasteEvent, 'clipboardData', {
      value: {
        getData: jest.fn((type) => {
          if (type === 'text/html') return wordHtml;
          if (type === 'text/plain') return 'Bold text Italic text';
          return '';
        })
      }
    });
    
    // Dispatch the paste event
    editor.dispatchEvent(pasteEvent);
    
    // Check if preventDefault was called
    expect(pasteEvent.defaultPrevented).toBe(true);
  });
}); 