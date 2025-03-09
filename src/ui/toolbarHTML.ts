import { ToolbarConfig, ToolbarState } from '../core/types';

export function createToolbarHTML(config: ToolbarConfig, state: ToolbarState): string {
    const themeClass = config.theme ? `theme-${config.theme}` : 'theme-dark';
    const html = `
        <div id="${config.toolbarId}" class="floating-toolbar ${state.isPersistent ? 'persistent-position' : ''} ${themeClass}">
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
                    ${config.buttons.script?.subscript ? `
                        <button id="${config.toolbarId}-subscript-button" title="Subscript">
                            <span class="material-icons" data-icon="subscript">subscript</span>
                        </button>
                    ` : ''}
                    ${config.buttons.script?.superscript ? `
                        <button id="${config.toolbarId}-superscript-button" title="Superscript">
                            <span class="material-icons" data-icon="superscript">superscript</span>
                        </button>
                    ` : ''}
                </div>
                
                <!-- Font selection group -->
                ${config.buttons.font?.enabled ? `
                    <div class="toolbar-group">
                        <button id="${config.toolbarId}-font-button" title="Font" data-format="font">
                            <span class="material-icons" data-icon="font_download">font_download</span>
                        </button>
                    </div>
                ` : ''}
                
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
                
                <!-- Alignment group -->
                ${(config.buttons.alignment?.left || config.buttons.alignment?.center || 
                   config.buttons.alignment?.right || config.buttons.alignment?.justify) ? `
                    <div class="toolbar-group">
                        ${config.buttons.alignment?.left ? `
                            <button id="${config.toolbarId}-align-left-button" title="Align Left">
                                <span class="material-icons" data-icon="format_align_left">format_align_left</span>
                            </button>
                        ` : ''}
                        ${config.buttons.alignment?.center ? `
                            <button id="${config.toolbarId}-align-center-button" title="Align Center">
                                <span class="material-icons" data-icon="format_align_center">format_align_center</span>
                            </button>
                        ` : ''}
                        ${config.buttons.alignment?.right ? `
                            <button id="${config.toolbarId}-align-right-button" title="Align Right">
                                <span class="material-icons" data-icon="format_align_right">format_align_right</span>
                            </button>
                        ` : ''}
                        ${config.buttons.alignment?.justify ? `
                            <button id="${config.toolbarId}-align-justify-button" title="Justify">
                                <span class="material-icons" data-icon="format_align_justify">format_align_justify</span>
                            </button>
                        ` : ''}
                    </div>
                ` : ''}

                <!-- Link button -->
                ${config.buttons.link?.url ? `
                    <div class="toolbar-group">
                        <button id="${config.toolbarId}-link-button" title="Link">
                            <span class="material-icons" data-icon="link">link</span>
                        </button>
                    </div>
                ` : ''}
            </div>
            <div class="toolbar-link-input">
                <input type="text" id="${config.toolbarId}-link-input" placeholder="Enter URL">
                <button id="${config.toolbarId}-save-link" title="Save">
                    <span class="material-icons" data-icon="check">check</span>
                </button>
                <button id="${config.toolbarId}-cancel-link" title="Cancel">
                    <span class="material-icons" data-icon="close">close</span>
                </button>
                <button id="${config.toolbarId}-remove-link" title="Remove Link">
                    <span class="material-icons" data-icon="link_off">link_off</span>
                </button>
                <button id="${config.toolbarId}-visit-link" title="Visit Link">
                    <span class="material-icons" data-icon="open_in_new">open_in_new</span>
                </button>
            </div>
            <div id="${config.toolbarId}-font-list" class="toolbar-font-select">
                <!-- Font list will be populated dynamically -->
            </div>
        </div>
    `;
    return html;
} 