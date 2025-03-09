import { describe, it, expect, afterEach } from '@jest/globals';
import { ToolbarStyleManager } from '@/styles/toolbar';

describe('ToolbarStyleManager', () => {
    afterEach(() => {
        // Clean up any injected styles
        ToolbarStyleManager.cleanup();
    });

    describe('injectRequiredStyles', () => {
        it('should inject required styles into document head', () => {
            ToolbarStyleManager.injectRequiredStyles();
            const styleElement = document.getElementById('floating-toolbar-required-styles');
            expect(styleElement).toBeTruthy();
            expect(styleElement?.tagName).toBe('STYLE');
        });

        it('should not inject duplicate styles', () => {
            ToolbarStyleManager.injectRequiredStyles();
            ToolbarStyleManager.injectRequiredStyles();
            const styleElements = document.querySelectorAll('#floating-toolbar-required-styles');
            expect(styleElements.length).toBe(1);
        });
    });

    describe('injectToolbarStyles', () => {
        it('should inject toolbar styles into document head', () => {
            ToolbarStyleManager.injectToolbarStyles();
            const styleElement = document.getElementById('floating-toolbar-styles');
            expect(styleElement).toBeTruthy();
            expect(styleElement?.tagName).toBe('STYLE');
        });

        it('should not inject duplicate styles', () => {
            ToolbarStyleManager.injectToolbarStyles();
            ToolbarStyleManager.injectToolbarStyles();
            const styleElements = document.querySelectorAll('#floating-toolbar-styles');
            expect(styleElements.length).toBe(1);
        });
    });

    describe('cleanup', () => {
        it('should remove all injected styles', () => {
            ToolbarStyleManager.injectRequiredStyles();
            ToolbarStyleManager.injectToolbarStyles();
            
            ToolbarStyleManager.cleanup();
            
            const requiredStyles = document.getElementById('floating-toolbar-required-styles');
            const toolbarStyles = document.getElementById('floating-toolbar-styles');
            expect(requiredStyles).toBeNull();
            expect(toolbarStyles).toBeNull();
        });

        it('should handle cleanup when no styles are injected', () => {
            expect(() => ToolbarStyleManager.cleanup()).not.toThrow();
        });
    });
}); 