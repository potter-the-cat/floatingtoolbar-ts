# Tesseract Floating Toolbar

A modern, customizable floating toolbar for rich text editing. The toolbar appears when text is selected and provides formatting options like bold, italic, underline, strikethrough, and drop caps.

## Features

- 🎯 Context-aware floating toolbar that follows text selection
- 🎨 Multiple themes (Dark, Light, Custom)
- ✨ Rich text formatting options
- 📱 Responsive design
- 🎯 Smart positioning to stay within viewport
- 🔧 Highly customizable

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

- `tests/visual/` - Playwright visual and interaction tests
  - `formatting.test.ts` - Text formatting functionality tests
  - `toolbar.visual.test.ts` - Toolbar appearance and positioning tests
- `src/tests/` - Unit tests
  - `formatting.test.ts` - Unit tests for formatting handlers
  - `link.test.ts` - Unit tests for link utilities
  - `toolbar.test.ts` - Unit tests for toolbar functionality

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

## License

This project is licensed under the MIT License - see the LICENSE file for details. 