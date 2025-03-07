export function createToolbarHTML(config, state) {
    const themeClass = config.theme ? `theme-${config.theme}` : 'theme-dark';
    const html = `
        <div id="${config.toolbarId}" class="floating-toolbar ${state.isFixed ? 'fixed-position' : ''} ${themeClass}">
            <div class="toolbar-initial">
                <!-- Text formatting group -->
                <div class="toolbar-group">
                    ${config.buttons.text.bold ? `
                        <button id="${config.toolbarId}-bold-button" title="Bold">
                            <span class="material-icons" data-icon="format_bold">format_bold</span>
                        </button>
                    ` : ''}
                    ${config.buttons.text.italic ? `
                        <button id="${config.toolbarId}-italic-button" title="Italic">
                            <span class="material-icons" data-icon="format_italic">format_italic</span>
                        </button>
                    ` : ''}
                    ${config.buttons.text.underline ? `
                        <button id="${config.toolbarId}-underline-button" title="Underline">
                            <span class="material-icons" data-icon="format_underline">format_underline</span>
                        </button>
                    ` : ''}
                    ${config.buttons.text.strikethrough ? `
                        <button id="${config.toolbarId}-strikethrough-button" title="Strikethrough">
                            <span class="material-icons" data-icon="format_strikethrough">format_strikethrough</span>
                        </button>
                    ` : ''}
                </div>
                
                <!-- Headings group -->
                ${(config.buttons.heading?.h1 || config.buttons.heading?.h2) ? `
                    <div class="toolbar-group">
                        ${config.buttons.heading?.h1 ? `
                            <button id="${config.toolbarId}-h1-button" title="Heading 1">
                                <span class="material-icons" data-icon="looks_one">looks_one</span>
                            </button>
                        ` : ''}
                        ${config.buttons.heading?.h2 ? `
                            <button id="${config.toolbarId}-h2-button" title="Heading 2">
                                <span class="material-icons" data-icon="looks_two">looks_two</span>
                            </button>
                        ` : ''}
                    </div>
                ` : ''}
                
                <!-- Special formatting group -->
                ${(config.buttons.special?.code || config.buttons.special?.quote ||
        config.buttons.special?.dropCap || config.buttons.special?.hr) ? `
                    <div class="toolbar-group">
                        ${config.buttons.special?.code ? `
                            <button id="${config.toolbarId}-code-button" title="Code">
                                <span class="material-icons" data-icon="code">code</span>
                            </button>
                        ` : ''}
                        ${config.buttons.special?.quote ? `
                            <button id="${config.toolbarId}-quote-button" title="Quote">
                                <span class="material-icons" data-icon="format_quote">format_quote</span>
                            </button>
                        ` : ''}
                        ${config.buttons.special?.dropCap ? `
                            <button id="${config.toolbarId}-drop-cap-button" title="Drop Cap">
                                <span class="material-icons" data-icon="format_size">format_size</span>
                            </button>
                        ` : ''}
                        ${config.buttons.special?.hr ? `
                            <button id="${config.toolbarId}-hr-button" title="Horizontal Rule">
                                <span class="material-icons" data-icon="horizontal_rule">horizontal_rule</span>
                            </button>
                        ` : ''}
                    </div>
                ` : ''}

                <!-- List formatting group -->
                ${(config.buttons.list?.bullet || config.buttons.list?.number) ? `
                    <div class="toolbar-group">
                        ${config.buttons.list?.bullet ? `
                            <button id="${config.toolbarId}-bullet-list-button" title="Bullet List">
                                <span class="material-icons" data-icon="format_list_bulleted">format_list_bulleted</span>
                            </button>
                        ` : ''}
                        ${config.buttons.list?.number ? `
                            <button id="${config.toolbarId}-number-list-button" title="Numbered List">
                                <span class="material-icons" data-icon="format_list_numbered">format_list_numbered</span>
                            </button>
                        ` : ''}
                    </div>
                ` : ''}

                <!-- Link group -->
                ${config.buttons.link?.url ? `
                    <div class="toolbar-group">
                        <button id="${config.toolbarId}-link-button" title="Add Link">
                            <span class="material-icons" data-icon="link">link</span>
                        </button>
                    </div>
                ` : ''}
            </div>
            <div class="toolbar-link-input">
                <input type="text" id="${config.toolbarId}-link-input" placeholder="Enter URL...">
                <button id="${config.toolbarId}-visit-link" class="toolbar-button" type="button" title="Visit URL">
                    <span class="material-icons" data-icon="open_in_new">open_in_new</span>
                </button>
                <button id="${config.toolbarId}-remove-link" class="toolbar-button" type="button" title="Remove link">
                    <span class="material-icons" data-icon="delete">delete</span>
                </button>
                <button id="${config.toolbarId}-save-link" class="toolbar-button" type="button" title="Save">
                    <span class="material-icons" data-icon="check">check</span>
                </button>
                <button id="${config.toolbarId}-cancel-link" class="toolbar-button" type="button" title="Cancel">
                    <span class="material-icons" data-icon="close">close</span>
                </button>
            </div>
        </div>
    `;
    return html;
}
//# sourceMappingURL=toolbarHTML.js.map