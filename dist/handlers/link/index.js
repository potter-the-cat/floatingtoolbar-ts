export function handleLinkButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();
    // Set processing flag
    this.state.isProcessingLinkClick = true;
    // Store current width before switching views
    const currentWidth = this.elements.toolbar?.getBoundingClientRect().width;
    // Update state
    this.state.currentView = 'linkInput';
    // Update view
    this.updateView();
    // Wait for next frame to ensure DOM has updated
    requestAnimationFrame(() => {
        try {
            // Double check state is still correct
            if (this.state.currentView === 'linkInput' && this.elements.linkInput) {
                // Ensure input is visible and interactive
                this.elements.linkInput.style.display = 'flex';
                this.elements.linkInput.disabled = false;
                this.elements.linkInput.style.pointerEvents = 'auto';
                // Force enable input and focus
                setTimeout(() => {
                    if (this.elements.linkInput) {
                        this.elements.linkInput.disabled = false;
                        this.elements.linkInput.style.pointerEvents = 'auto';
                        this.elements.linkInput.focus();
                        if (this.elements.linkInput.value) {
                            this.elements.linkInput.select(); // Select all text if there's existing content
                        }
                    }
                }, 0);
                // Calculate minimum width needed for link input view
                const inputWidth = 250; // Base input width
                const buttonWidth = 32; // Width per button
                const buttonCount = this.state.existingLink ? 4 : 3; // 3 buttons normally, 4 with remove button
                const padding = 8; // Total horizontal padding
                const gaps = 4 * (buttonCount + 1); // Gap between elements
                const minWidth = inputWidth + (buttonWidth * buttonCount) + padding + gaps;
                // Set a new width for the link input view, ensuring it's not smaller than needed
                const linkInputWidth = Math.max(minWidth, Math.min(currentWidth || 0, 450));
                if (this.elements.toolbar) {
                    this.elements.toolbar.style.setProperty('--toolbar-width', `${linkInputWidth}px`);
                }
                this.debug('Link input view shown, input focused');
            }
            else {
                this.debug('View state changed before input could be focused');
            }
        }
        finally {
            // Clear processing flag after the frame
            setTimeout(() => {
                this.state.isProcessingLinkClick = false;
            }, 0);
        }
    });
}
export function handleSaveLinkClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.elements.linkInput)
        return;
    const url = this.elements.linkInput.value.trim();
    if (url && this.state.selectedText && this.state.selectionRange) {
        this.debug("User has saved the link", url);
        this.debug("Selected text", this.state.selectedText);
        try {
            if (this.state.existingLink) {
                // If editing an existing link, just update its href
                this.state.existingLink.href = window.ensureValidUrl(url);
                this.debug("Updated existing link", this.state.existingLink.outerHTML);
            }
            else {
                // Create new link as before
                const link = document.createElement('a');
                link.href = window.ensureValidUrl(url);
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.textContent = this.state.selectedText;
                // Use the stored range to insert the link
                const range = this.state.selectionRange;
                range.deleteContents();
                range.insertNode(link);
                // Normalize the parent to fix any text nodes
                if (link.parentNode) {
                    link.parentNode.normalize();
                }
                this.debug("Created new link", link.outerHTML);
            }
            // Clear selection and update state
            window.getSelection()?.removeAllRanges();
            this.state.isVisible = false;
            this.state.currentSelection = null;
            this.state.selectedText = '';
            this.state.selectionRange = null;
            this.state.selectionRect = null;
            this.state.existingLink = null;
            this.elements.linkInput.value = '';
            // Reset view state to initial
            this.state.currentView = 'initial';
            // Update view
            this.updateView();
        }
        catch (error) {
            console.error("Error handling link:", error);
            console.error("Error details:", {
                selectedText: this.state.selectedText,
                range: this.state.selectionRange,
                existingLink: this.state.existingLink,
                error: error.message
            });
        }
    }
    else {
        this.debug("No URL or selection available", {
            url: url,
            selectedText: this.state.selectedText,
            hasRange: Boolean(this.state.selectionRange),
            existingLink: this.state.existingLink
        });
    }
}
export function handleCancelLinkClick(e) {
    e.preventDefault();
    e.stopPropagation();
    // Update state but maintain visibility and position
    this.state.currentView = 'initial';
    if (this.elements.linkInput) {
        this.elements.linkInput.value = '';
    }
    // Remove the width constraint when returning to initial view
    if (this.elements.toolbar) {
        this.elements.toolbar.style.removeProperty('--toolbar-width');
    }
    // Update view
    this.updateView();
}
export function handleRemoveLinkClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.existingLink && this.state.selectionRange) {
        try {
            // Get the text content of the link
            const textContent = this.state.existingLink.textContent;
            // Create a text node to replace the link
            const textNode = document.createTextNode(textContent || '');
            // Replace the link with the text node
            this.state.existingLink.parentNode?.replaceChild(textNode, this.state.existingLink);
            this.debug("Removed link, preserved text", textContent);
            // Clear selection and update state
            window.getSelection()?.removeAllRanges();
            this.state.isVisible = false;
            this.state.currentSelection = null;
            this.state.selectedText = '';
            this.state.selectionRange = null;
            this.state.selectionRect = null;
            this.state.existingLink = null;
            if (this.elements.linkInput) {
                this.elements.linkInput.value = '';
            }
            // Reset view state to initial
            this.state.currentView = 'initial';
            // Update view
            this.updateView();
        }
        catch (error) {
            console.error("Error removing link:", error);
        }
    }
}
export function handleLinkInputChange(e) {
    const target = e.target;
    const url = target.value.trim();
    updateVisitButton.call(this, url);
}
export function handleVisitLinkClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.elements.linkInput)
        return;
    const url = this.elements.linkInput.value.trim();
    if (window.isValidUrl(url)) {
        const fullUrl = window.ensureValidUrl(url);
        window.open(fullUrl, '_blank', 'noopener,noreferrer');
    }
}
export function updateVisitButton(url) {
    if (this.elements.visitLink) {
        const isValid = window.isValidUrl(url);
        this.elements.visitLink.style.display = isValid ? 'flex' : 'none';
        this.debug(`Visit button visibility updated: ${isValid}`, { url });
    }
}
export function checkForExistingLink(selection) {
    if (selection.rangeCount === 0)
        return null;
    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;
    // If the common ancestor is a text node, check its parent
    const element = commonAncestor.nodeType === Node.TEXT_NODE
        ? commonAncestor.parentElement
        : commonAncestor;
    // If the element is a link, return it
    if (element?.tagName === 'A') {
        return element;
    }
    // Otherwise, look for the closest link ancestor
    return window.findClosestLink(element);
}
//# sourceMappingURL=index.js.map