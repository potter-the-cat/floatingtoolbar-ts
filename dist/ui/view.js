export function updateView() {
    if (!this.elements.toolbar)
        return;
    // In fixed mode, toolbar is always displayed
    if (this.state.isFixed) {
        this.elements.toolbar.classList.add('visible');
    }
    else {
        this.elements.toolbar.classList.toggle('visible', this.state.isVisible);
    }
    // Handle current view
    if (this.state.currentView === 'initial') {
        if (this.elements.toolbarInitial) {
            this.elements.toolbarInitial.style.display = 'flex';
        }
        if (this.elements.toolbarLinkInput && this.elements.linkInput) {
            this.elements.toolbarLinkInput.style.display = 'none';
            // Reset link input state only if it exists
            this.elements.linkInput.disabled = false;
            this.elements.linkInput.style.pointerEvents = 'auto';
        }
    }
    else if (this.state.currentView === 'linkInput' && this.elements.toolbarLinkInput) {
        if (this.elements.toolbarInitial) {
            this.elements.toolbarInitial.style.display = 'none';
        }
        if (this.elements.toolbarLinkInput && this.elements.linkInput) {
            this.elements.toolbarLinkInput.style.display = 'flex';
            // Ensure link input is enabled and focusable
            this.elements.linkInput.disabled = false;
            this.elements.linkInput.style.pointerEvents = 'auto';
            // Show/hide remove button based on whether we're editing an existing link
            if (this.elements.removeLink) {
                this.elements.removeLink.style.display = this.state.existingLink ? 'flex' : 'none';
            }
            // Update visit button based on current URL
            if (this.elements.linkInput && this.elements.visitLink) {
                this.updateVisitButton(this.elements.linkInput.value.trim());
            }
        }
    }
    // Update position if visible
    if (this.state.isVisible || this.state.isFixed) {
        this.updatePosition();
    }
}
//# sourceMappingURL=view.js.map