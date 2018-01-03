/**
 * модуль просмотрщика
 */
var Viewer = (function () {
    /** private */
    let local = {
        sizes: {
            width: 400,
            height: 300
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
            show: false,
            current: 0,
            items: []
        }
    };
    let self = {
            /**
             * init plugin
             * @returns {boolean}
             */
            initialize: function () {
                if (local.data.show == true) {
                    return false;
                }
                let els = local.elements;
                els.overlay = $(Template.render('viewer', 'template')).appendTo('body');
                let win = els.window;
                win.loading = $('.viewer-loading', els.overlay);
                win.same = $('.viewer-window', els.overlay).css({
                    'left': '30%',
                    'right': '30%',
                    'top': '30%',
                    'bottom': '30%'
                });
                win.header = $('.viewer-header', win.same);
                win.content = $('.viewer-content', win.same);
                win.buttons = $('.viewer-buttons', win.same);

                /** overlay click close */
                els.overlay.on('click', function (e) {
                    if ($(e.target).hasClass('viewer-overlay')) {
                        return self.hide();
                    }
                    if ($(e.target).hasClass('viewer-image') || $(e.target).hasClass('viewer-content')) {
                        if (local.data.items.length > 1) {
                            let x = e.offsetX == undefined ? e.layerX : e.offsetX;
                            let w = local.elements.window.content.width() / 2;
                            if (x > w) {
                                self.next();
                            }
                            if (x <= w) {
                                self.previous();
                            }
                        }
                    }
                });
                /** buttons */
                win.buttons.delegate('.viewer-button', 'click', function () {
                    let button = $(this);
                    let id = button.attr('id');
                    switch (id) {
                        case 'previous':
                            self.previous();
                            break;
                        case 'next':
                            self.next();
                            break;
                    }
                });
                /** close */
                $('.viewer-header-close', win.header).on('click', function () {
                    self.hide();
                });
                /** clipboard */
                let clipboard = new Clipboard('#copy_link');
                clipboard.on('success', function (e) {
                    Notice.notify(Lang.get()['viewer']['notice']['copy_link'] + ': <br>' + e.text);
                });
                clipboard.on('error', function (e) {
                    Notice.error(Lang.get()['viewer']['notice']['error_copy']);
                });
                /** start */
                $(document).undelegate('a.--webfile', 'click').delegate('a.--webfile', 'click', function (e) {
                    let object = Tool.getFileType($(this).attr('href'));
                    if (object.type != 'file') {
                        e.preventDefault();
                        self.set($(this));
                    }
                });
            },
            /**
             * set elements
             * @param element
             */
            set: function (element) {
                local.data.items = [];
                local.data.current = 0;
                local.elements.window.content.empty();
                $('.viewer-header-text', local.elements.window.header).empty();
                /** check nearby el */
                let parents = element.parents('.--webgallery');
                if (parents.length > 0) {
                    /** maybe it's a gallery */
                    let child = parents.find('.--webfile');
                    child.each(function (i) {
                        self.addElementToList($(this), i);
                    });
                    local.data.current = child.index(element);
                } else {
                    self.addElementToList(element, 0);
                }
                if (local.data.items.length > 1) {
                    local.elements.window.same.addClass('gallery');
                } else {
                    local.elements.window.same.removeClass('gallery');
                }
                self.show();
            },
            /**
             * append elements to item list
             * @param element
             */
            addElementToList: function (element) {
                let title = $.trim(element.text()) || (element.attr('title') ? element.attr('title').split(' ')[0] : '') || '';
                let link = element.attr('href') || '';
                local.data.items.push({
                    target: element,
                    link: link,
                    title: title,
                    index: 0,
                    info: Tool.getFileType(link)
                })
            },
            /**
             * show element
             * @param index
             */
            showItem: function (index) {
                self.loading(true);
                let item = local.data.items[index];
                $('.viewer-header-text', local.elements.window.header).html(item.title);
                $('.viewer-gallery-count', local.elements.window.buttons).html(Lang.get()['viewer']['file'] + ' ' + (index + 1) + ' ' + Lang.get()['viewer']['of'] + ' ' + local.data.items.length);
                $('#download_link', local.elements.window.buttons).attr({'href': item.link}).prop('download', item.title);
                $('#copy_link', local.elements.window.buttons).attr({'data-clipboard-text': item.link});
                /** wh */
                let max_width = $(window).width() - 20;
                let max_height = $(window).height() - 120;
                local.elements.window.content.empty();
                switch (item.info.type) {
                    case 'image':
                        let image = new Image();
                        image.onload = function () {
                            self.loading(false);
                            let width = this.width;
                            let height = this.height;
                            if (width > max_width) {
                                let x = (width - max_width) / width;
                                width = width - (width * x);
                                height = height - (height * x);
                            }
                            if (height > max_height) {
                                let y = (height - max_height) / height;
                                height = height - (height * y);
                                width = width - (width * y);
                            }
                            let image_pos = {
                                left: 0,
                                top: 0
                            };
                            if (width < local.sizes.width) {
                                image_pos.left = (local.sizes.width - width) / 2;
                                width = local.sizes.width;
                            }
                            if (height < local.sizes.height) {
                                image_pos.top = (local.sizes.height - height) / 2;
                                height = local.sizes.height;
                            }
                            let pos = {
                                left: ($(window).width() - 20 - width) / 2,
                                top: ($(window).height() - 80 - height) / 2
                            };
                            local.elements.window.same.css({
                                'left': pos.left + 'px',
                                'right': pos.left + 'px',
                                'top': pos.top + 'px',
                                'bottom': pos.top + 'px'
                            });
                            let image_div = $('<div class="viewer-image"></div>').css({
                                'background-image': 'url(' + $(image).attr('src') + ')',
                                'left': image_pos.left + 'px',
                                'right': image_pos.left + 'px',
                                'top': image_pos.top + 'px',
                                'bottom': image_pos.top + 'px'
                            });
                            local.elements.window.content.append(image_div);
                            local.elements.overlay.focus();
                        };
                        image.onerror = function () {
                            /** error callback */
                            self.loading(false);
                        };
                        image.src = item.link + '?' + new Date().getTime();
                        break;
                    case 'doc':
                    case 'xls':
                        local.elements.window.same.css({
                            'left': '10px',
                            'right': '10px',
                            'top': '10px',
                            'bottom': '10px'
                        });
                        local.elements.window.content.append('<iframe id="viewer-frame" width="100%" height="100%" src="https://view.officeapps.live.com/op/view.aspx?src=' + item.link + '?' + new Date().getTime() + '&embedded=true" frameborder="0"></iframe>');
                        self.loading(false);
                        break;
                    case 'pdf':
                        local.elements.window.same.css({
                            'left': '10px',
                            'right': '10px',
                            'top': '10px',
                            'bottom': '10px'
                        });
                        local.elements.window.content.append('<iframe id="viewer-frame" width="100%" height="100%" src="http://docs.google.com/gview?url=' + item.link + '?' + new Date().getTime() + '&embedded=true" frameborder="0"></iframe>');
                        self.loading(false);
                        break;
                    default:
                        local.elements.window.content.append('<div class="viewer-unknown-format">' + Lang.get()['viewer']['unknown'] + '</div>');
                        self.loading(false);
                        break;
                }
            },
            /**
             * show window
             */
            show: function () {
                $(document).on('keyup.viewer', function (e) {
                        console.log(e);
                        if (e.keyCode == 27) {
                            self.hide();
                            return false;
                        }
                        if (local.data.items.length > 1) {
                            if (e.keyCode == 37) {
                                return self.previous();
                            }
                            if (e.keyCode == 39) {
                                return self.next();
                            }
                        }
                        if (e.keyCode == 67 && e.ctrlKey) {
                            $('#copy_link', local.elements.window.buttons).trigger('click');
                            e.preventDefault();
                        }
                    }
                );
                local.data.show = true;
                local.elements.overlay.show();
                self.showItem(local.data.current);
            },
            /**
             * hide window
             */
            hide: function () {
                $(document).off('keyup.viewer');
                local.elements.overlay.hide();
                local.elements.window.content.css({
                    'background-image': 'none'
                });
            },
            /**
             * next item
             */
            next: function () {
                let current = local.data.current;
                let length = local.data.items.length;
                let next = current + 1;
                if (next >= length) {
                    next = 0;
                }
                local.data.current = next;
                self.showItem(next);
            },
            /**
             * prev item
             */
            previous: function () {
                let current = local.data.current;
                let length = local.data.items.length;
                let prev = current - 1;
                if (prev < 0) {
                    prev = length - 1;
                }
                local.data.current = prev;
                self.showItem(prev);
            },
            /**
             * load screen
             * @param show
             */
            loading: function (show) {
                if (show) {
                    local.elements.window.loading.show();
                } else {
                    local.elements.window.loading.hide();
                }
            }
        }
    ;
    /** constructor */
    self.initialize();
    /** public */
    return self;
})();