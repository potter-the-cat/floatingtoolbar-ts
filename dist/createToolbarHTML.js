export function createToolbarHTML(config, state) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
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
                ${(((_a = config.buttons.heading) === null || _a === void 0 ? void 0 : _a.h1) || ((_b = config.buttons.heading) === null || _b === void 0 ? void 0 : _b.h2)) ? `
                    <div class="toolbar-group">
                        ${((_c = config.buttons.heading) === null || _c === void 0 ? void 0 : _c.h1) ? `
                            <button id="${config.toolbarId}-h1-button" title="Heading 1">
                                <span class="material-icons" data-icon="looks_one">looks_one</span>
                            </button>
                        ` : ''}
                        ${((_d = config.buttons.heading) === null || _d === void 0 ? void 0 : _d.h2) ? `
                            <button id="${config.toolbarId}-h2-button" title="Heading 2">
                                <span class="material-icons" data-icon="looks_two">looks_two</span>
                            </button>
                        ` : ''}
                    </div>
                ` : ''}
                
                <!-- Special formatting group -->
                ${(((_e = config.buttons.special) === null || _e === void 0 ? void 0 : _e.code) || ((_f = config.buttons.special) === null || _f === void 0 ? void 0 : _f.quote) ||
        ((_g = config.buttons.special) === null || _g === void 0 ? void 0 : _g.dropCap) || ((_h = config.buttons.special) === null || _h === void 0 ? void 0 : _h.hr)) ? `
                    <div class="toolbar-group">
                        ${((_j = config.buttons.special) === null || _j === void 0 ? void 0 : _j.code) ? `
                            <button id="${config.toolbarId}-code-button" title="Code">
                                <span class="material-icons" data-icon="code">code</span>
                            </button>
                        ` : ''}
                        ${((_k = config.buttons.special) === null || _k === void 0 ? void 0 : _k.quote) ? `
                            <button id="${config.toolbarId}-quote-button" title="Quote">
                                <span class="material-icons" data-icon="format_quote">format_quote</span>
                            </button>
                        ` : ''}
                        ${((_l = config.buttons.special) === null || _l === void 0 ? void 0 : _l.dropCap) ? `
                            <button id="${config.toolbarId}-drop-cap-button" title="Drop Cap">
                                <span class="material-icons" data-icon="format_size">format_size</span>
                            </button>
                        ` : ''}
                        ${((_m = config.buttons.special) === null || _m === void 0 ? void 0 : _m.hr) ? `
                            <button id="${config.toolbarId}-hr-button" title="Horizontal Rule">
                                <span class="material-icons" data-icon="horizontal_rule">horizontal_rule</span>
                            </button>
                        ` : ''}
                    </div>
                ` : ''}

                <!-- List formatting group -->
                ${(((_o = config.buttons.list) === null || _o === void 0 ? void 0 : _o.bullet) || ((_p = config.buttons.list) === null || _p === void 0 ? void 0 : _p.number)) ? `
                    <div class="toolbar-group">
                        ${((_q = config.buttons.list) === null || _q === void 0 ? void 0 : _q.bullet) ? `
                            <button id="${config.toolbarId}-bullet-list-button" title="Bullet List">
                                <span class="material-icons" data-icon="format_list_bulleted">format_list_bulleted</span>
                            </button>
                        ` : ''}
                        ${((_r = config.buttons.list) === null || _r === void 0 ? void 0 : _r.number) ? `
                            <button id="${config.toolbarId}-number-list-button" title="Numbered List">
                                <span class="material-icons" data-icon="format_list_numbered">format_list_numbered</span>
                            </button>
                        ` : ''}
                    </div>
                ` : ''}

                <!-- Link group -->
                ${((_s = config.buttons.link) === null || _s === void 0 ? void 0 : _s.url) ? `
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
