/**
 * модуль окна
 * @param data
 * @returns {{initialize: initialize, show: show, loading: loading, hide: hide}}
 * @constructor
 */
window.Windows = function (data) {
    /** private */
    let local = {
        config: {
            id: '',
            title: '',
            no_scroll: false,
            sizes: {
                height: 300,
                width: 400
            },
            buttons: {},
            close: function () {

            },
            modal: false
        },
        elements: {
            overlay: null,
            window: {
                same: null,
                loading: null,
                header: null,
                content: null,
                buttons: null
            }
        },
        data: {
            show: false
        }
    };
    /**
     * определение в каком виде размеры
     * @returns {{left, top}}
     */
    let checkSizeSystem = function () {
        return {
            left: function () {
                let width = local.config.sizes.width.toString();
                let left = '';
                switch (true) {
                    case /%$/.test(width):
                        left = ((100 - parseInt(width)) / 2) + '%';
                        break;
                    case /px$/.test(width):
                        left = (($(window).width() - parseInt(width)) / 2) + 'px';
                        break;
                    default:
                        left = (($(window).width() - parseInt(width)) / 2) + 'px';
                        break;
                }
                return left;
            }(),
            top: function () {
                let height = local.config.sizes.height.toString();
                let left = '';
                switch (true) {
                    case /%$/.test(height):
                        left = ((100 - parseInt(height)) / 2) + '%';
                        break;
                    case /px$/.test(height):
                        left = (($(window).height() - parseInt(height)) / 2) + 'px';
                        break;
                    default:
                        left = (($(window).height() - parseInt(height)) / 2) + 'px';
                        break;
                }
                return left;
            }()
        };
    };

    let self = {
        /**
         * инициализация
         * @param data ({
         *      id: '',
         *      title: '',
         *      no_scroll: false,
         *      sizes: {
         *          height: '',
         *          width: ''
         *          },
         *      buttons: {},
         *      close: function () {
         *      }})
         */
        initialize: function (data) {
            let self = this;
            /** extend data with config */
            $.extend(local.config, data);
            /** set elements */
            let els = local.elements;
            els.overlay = $(Template.render('windows', 'simple', {
                id: local.config.id,
                title: local.config.title
            }));
            let win = els.window;
            win.same = $('.windows-window', els.overlay);
            win.header = $('.windows-header', win.same);
            win.content = $('.windows-content', win.same);
            win.loading = $('.windows-loading', win.same);
            win.buttons = $('.windows-buttons', win.same);
            /** content */
            win.content.html(typeof local.config.content == 'function' ? local.config.content() : local.config.content);
            /** buttons */
            for (let id in local.config.buttons) {
                if (local.config.buttons.hasOwnProperty(id)) {
                    let button = local.config.buttons[id];
                    if (button.checkbox) {
                        win.buttons.append(new Elements.checkbox(id, button.title, false, button.additional_class).on('click', function () {
                            if (typeof button.callback == 'function') {
                                button.callback(self);
                            }
                        }));
                    } else {
                        win.buttons.append(new Elements.button(id, button.title, button.additional_class).on('click', function () {
                            button.callback(self);
                        }));
                    }
                }
            }
            /** sizes and position */
            win.same.width(local.config.sizes.width);
            win.same.height(local.config.sizes.height);
            let pos = checkSizeSystem();
            win.same.css({
                left: pos.left,
                top: pos.top
            });
            /** no scroll */
            if (local.config.no_scroll) {
                win.content.addClass('no-scroll');
            }
            /** binds */
            $('.windows-header-close', win.header).on('click', function () {
                els.overlay.hide();
                if (typeof local.config.close == 'function') {
                    local.config.close();
                }
                els.overlay.remove();
            });
            if (local.config.modal == false) {
                els.overlay.on('click', function (e) {
                    if ($(e.target).hasClass('windows-overlay')) {
                        els.overlay.hide();
                        if (typeof local.config.close == 'function') {
                            local.config.close();
                        }
                        els.overlay.remove();
                        e.preventDefault();
                    }
                });
            }
            win.same.draggable({cursor: 'move', handle: win.header, containment: els.overlay, scroll: false});
        },
        /**
         * покажем
         */
        show: function () {
            if (local.data.show == false) {
                local.data.show = true;
                local.elements.overlay.appendTo('body');
            }
        },
        /**
         * окошко загрузки
         * @param show
         */
        loading: function (show) {
            if (show) {
                local.elements.window.loading.show();
            } else {
                local.elements.window.loading.hide();
            }
        },
        hide: function () {
            local.elements.overlay.remove();
        }
    };
    /** constructor */
    self.initialize(data);
    /** public */
    return self;
};