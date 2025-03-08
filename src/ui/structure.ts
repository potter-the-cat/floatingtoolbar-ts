import { ToolbarConfig, ToolbarState } from '../core/types';
import { createToolbarHTML } from './toolbarHTML';

export function setupStructure(
    targetElement: HTMLElement,
    config: ToolbarConfig,
    state: ToolbarState,
    addRequiredStyles: () => void
): void {
    if (config.useExistingToolbar) {
        // First, find or create the content wrapper
        let contentWrapper = targetElement.closest('.content-wrapper');
        if (!contentWrapper) {
            contentWrapper = document.createElement('div');
            contentWrapper.className = 'content-wrapper';
            if (targetElement.parentNode) {
                targetElement.parentNode.insertBefore(contentWrapper, targetElement);
                contentWrapper.appendChild(targetElement);
            }
        }

        // Find the toolbar container using the container config option if provided
        const containerSelector = config.container || '.content-wrapper';
        const containerElement = document.querySelector(containerSelector);
        const toolbarContainer = containerElement ? containerElement.querySelector('.toolbar-container') : null;
        
        if (!toolbarContainer) {
            console.error('FloatingToolbar: Existing toolbar container not found');
            return;
        }
    } else {
        // Original setup for dynamically created toolbars
        let contentWrapper = targetElement.closest('.content-wrapper');
        if (!contentWrapper) {
            contentWrapper = document.createElement('div');
            contentWrapper.className = 'content-wrapper';
            if (targetElement.parentNode) {
                targetElement.parentNode.insertBefore(contentWrapper, targetElement);
                contentWrapper.appendChild(targetElement);
            }
        }

        // Create toolbar container if needed
        let toolbarContainer = contentWrapper.querySelector('.toolbar-container');
        if (!toolbarContainer) {
            toolbarContainer = document.createElement('div');
            toolbarContainer.className = 'toolbar-container';
            contentWrapper.insertBefore(toolbarContainer, contentWrapper.firstChild);
        }

        // Only create toolbar HTML if we're not using an existing one
        toolbarContainer.innerHTML = createToolbarHTML(config, state);
    }

    // Update target element
    targetElement.classList.add('content');
    if (!targetElement.hasAttribute('contenteditable')) {
        targetElement.setAttribute('contenteditable', 'true');
    }

    // Add required styles
    addRequiredStyles();
} 