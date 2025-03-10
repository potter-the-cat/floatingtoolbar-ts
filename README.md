# Floating Toolbar Editor

A modern, lightweight WYSIWYG editor with a context-aware floating toolbar. Built by [Tesseract](https://www.4-cube.io).


## Overview

The Floating Toolbar Editor is a sophisticated yet lightweight WYSIWYG editor that provides a context-aware floating toolbar for text formatting. Built by the team at Tesseract, it offers a modern and intuitive editing experience similar to popular platforms like Medium or Notion.

## Features

- 🎯 Context-aware floating toolbar that follows text selection
- 🎨 Multiple themes (Dark, Light, Custom)
- ✨ Rich text formatting options:
  - Text styling (bold, italic, underline, strikethrough)
  - Headings (H1, H2)
  - Special formatting (drop caps, code blocks, quotes, horizontal rules)
  - Lists (bullet, numbered)
  - Links (add, edit, remove)
  - Text alignment (left, center, right, justify)
  - Font selection (with Google Fonts integration)
- 📱 Responsive design
- 🎯 Smart positioning to stay within viewport
- 🔧 Highly customizable configuration
- 🔄 Multiple toolbar modes (floating or persistent)

## Installation

There are several ways to include the Floating Toolbar in your project:

### Option 1: Download and include directly

1. Download the distribution files from the `dist/` directory
2. Include the script in your HTML:

```html
<script src="path/to/FloatingToolbar.js"></script>
```


### Option 2: Build from source

If you want to customize the library, clone this repo and then:

```bash
cd floatingtoolbar-ts
npm install
npm run build
```

Or copy the built files from the `dist/` directory to your project.

## Basic Usage

1. Include the script in your HTML:

```html
<script src="dist/FloatingToolbar.js"></script>
```

2. Create a container with editable content:

```html
<div id="editor">
  <div class="content" contenteditable="true">
    <p>Select some text to see the floating toolbar in action.</p>
  </div>
</div>
```

3. Initialize the toolbar:

```javascript
document.addEventListener('DOMContentLoaded', function() {
  window.FloatingToolbar.init({
    container: '#editor',
    content: '.content',
    mode: 'floating',
    theme: 'dark'
  });
});
```

## Configuration Options

The toolbar can be extensively customized:

```javascript
window.FloatingToolbar.init({
  // Required settings
  container: '#editor',          // Selector for the editor container
  content: '.content',           // Selector for the editable content

  // Optional settings
  mode: 'floating',              // 'floating' or 'persistent'
  theme: 'dark',                 // 'dark', 'light', or 'custom'
  debug: false,                  // Enable debug logging
  offset: { x: 0, y: 10 },       // Offset from selection
  toolbarId: 'my-toolbar',       // Custom ID for the toolbar
  
  // Button configuration
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
      dropCap: true,
      code: true,
      quote: true,
      hr: true
    },
    list: {
      bullet: true,
      number: true
    },
    link: {
      url: true
    },
    alignment: {
      left: true,
      center: true,
      right: true,
      justify: true
    },
    font: {
      enabled: true
    }
  },
  
  // Font configuration (when font.enabled is true)
  fontConfig: {
    defaultFonts: [
      'Arial',
      'Times New Roman',
      'Georgia',
      'Verdana'
    ],
    googleFonts: {
      families: [
        'Roboto',
        'Open Sans',
        'Lato',
        'Playfair Display'
      ],
      display: 'swap'
    }
  }
});
```

## Examples

### Floating Toolbar (Dark Theme)

```javascript
window.FloatingToolbar.init({
  container: '#dark-editor',
  content: '.dark-content',
  mode: 'floating',
  theme: 'dark',
  buttons: {
    text: {
      bold: true,
      italic: true,
      underline: true,
      strikethrough: true
    },
    heading: {
      h1: true,
      h2: true
    },
    special: {
      code: true,
      quote: true,
      hr: true
    },
    list: {
      bullet: true,
      number: true
    },
    link: {
      url: true
    },
    alignment: {
      left: true,
      center: true,
      right: true,
      justify: true
    }
  }
});
```

### Floating Toolbar (Light Theme)

```javascript
window.FloatingToolbar.init({
  container: '#light-editor',
  content: '.light-content',
  mode: 'floating',
  theme: 'light',
  buttons: {
    text: {
      bold: true,
      italic: true,
      underline: true
    },
    link: {
      url: true
    }
  }
});
```

### Custom Theme with Font Selection

```javascript
window.FloatingToolbar.init({
  container: '#font-editor',
  content: '.font-content',
  mode: 'floating',
  theme: 'custom',
  buttons: {
    text: {
      bold: true,
      italic: true
    },
    font: {
      enabled: true
    }
  },
  fontConfig: {
    defaultFonts: ['Arial', 'Times New Roman', 'Georgia'],
    googleFonts: {
      families: ['Roboto', 'Open Sans', 'Lato'],
      display: 'swap'
    }
  }
});
```

## Example Demos

The project includes several ready-to-use examples in the `examples/` directory:

- **floating-toolbar.html**: Demonstrates the basic floating toolbar with different themes and configurations
- **persistent-toolbar.html**: Shows how to create a persistent toolbar that stays in place
- **persistent-toolbar-with-save.html**: Demonstrates a persistent toolbar with save functionality

To run these examples:

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `node server.js`
4. Open your browser and navigate to:
   - http://localhost:3000/examples/floating-toolbar.html
   - http://localhost:3000/examples/persistent-toolbar.html
   - http://localhost:3000/examples/persistent-toolbar-with-save.html

These examples provide a great starting point for understanding how to implement and customize the Floating Toolbar in your own projects.

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
# or for development with watch mode
npm run dev
```

3. Start the development server:
```bash
node server.js
```

The demo will be available at http://localhost:3000

## Running Tests

### Visual Tests

The project uses Playwright for visual regression and interaction testing. To run the visual tests:

1. Ensure the development server is running:
```bash
node server.js
```

2. In a separate terminal, run the Playwright tests:
```bash
npx playwright test tests/visual/
```

This will run all visual tests, including:
- Toolbar appearance tests
- Text formatting functionality tests
- Theme switching tests
- Button state management tests

### Unit Tests

For unit tests, we use Jest:

```bash
npm test
```

## Test Structure

The project uses a comprehensive testing approach with both unit tests (Jest) and end-to-end tests (Playwright):

### Unit Tests (`tests/unit/`)

Unit tests are organized by component type:

- **Core Tests** (`tests/unit/core/`)
  - Tests for the core functionality of the toolbar
  - Includes tests for initialization, event handling, and state management

- **UI Tests** (`tests/unit/ui/`)
  - Tests for UI components and rendering
  - Includes tests for toolbar HTML generation and positioning

- **Handler Tests** (`tests/unit/handlers/`)
  - **Selection Handlers** (`tests/unit/handlers/selection/`)
    - Tests for text selection functionality
  - **Link Handlers** (`tests/unit/handlers/link/`)
    - Tests for link creation, editing, and removal
  - **Font Handlers** (`tests/unit/handlers/font/`)
    - Tests for font selection and application

### End-to-End Tests (`playwright/tests/`)

Playwright tests are divided into two categories:

- **Visual Tests** (`playwright/tests/visual/`)
  - `toolbar.test.ts` - Tests for toolbar appearance and positioning
  - `alignment.visual.test.ts` - Visual tests for text alignment features
  - `font.visual.test.ts` - Visual tests for font selection and application

- **Functional Tests** (`playwright/tests/functional/`)
  - `formatting.test.ts` - Tests for text formatting functionality
  - `alignment.test.ts` - Tests for text alignment functionality

### Running Tests

To run all tests:

```bash
# Run unit tests
npm run test:unit

# Run visual and functional tests
npm run test:visual

# Run all tests
npm run test:all
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Enterprise Features & Support

For professional software teams requiring enterprise-grade features and support, Tesseract offers:

- 🔒 Advanced security features
- 🎨 Custom theming and branding
- 🛠️ Additional formatting options
- 🔄 Integration support
- 🎯 Custom feature development

### Professional Support

Tesseract provides dedicated SLAs and enterprise support including:

- 24/7 technical support
- Priority bug fixes
- Custom feature development
- Integration consulting
- Performance optimization
- Security audits
- Training and documentation

## Get in Touch

For extended features and enterprise support, contact the Tesseract team:

- 🌐 Website: [4-cube.io](https://4-cube.io)

Built with ❤️ by Tesseract