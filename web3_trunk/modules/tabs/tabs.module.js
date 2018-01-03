/**
 * модуль табов
 * @type {Function}
 */
var Tabs = (function (config) {
    /** private */
    let local = {
        config: {
            tab_id: '',
            items: {},
            active: '',
            full: false,
            custom: null,
            resize: function () {
            },
            not_clear_content: false
        },
        body: null,
        header: null,
        content: null
    };

    /**
     * инициализация
     * @param config
     */
    let init = function (config) {
        $.extend(local.config, config);
        render();
        return this;
    };
    /**
     * прорисовка
     */
    let render = function () {
        try {
            local.body.empty();
            local.header = null;
            local.content = null;
        } catch (e) {
        }
        let items = [];
        let content = [];
        for (let id in local.config.items) {
            if (local.config.items.hasOwnProperty(id)) {
                let item = local.config.items[id];
                items.push({
                    id: id,
                    title: item.title || ''
                });
                content.push({
                    id: id,
                    content: item.content || ''
                })
            }
        }
        local.body = $(Template.render('tabs', 'tabs', {
            items: items,
            content: content,
            id: local.config.tab_id,
            full: local.config.full,
            custom: local.config.custom
        }));
        local.header = $('.tab-header', local.body);
        local.content = $('.tab-content', local.body);
        addListener();
        if (local.config.build) {
            for (let id in local.config.items) {
                if (local.config.items.hasOwnProperty(id)) {
                    setContent(id, true);
                }
            }
        }
        if (local.config.active != '') {
            local.header.find('#' + local.config.active).trigger('click');
        } else {
            local.header.find('.tab-header-item[rel=' + local.config.tab_id + ']').eq(0).trigger('click');
        }
    };
    /**
     * рисуем контент для таба
     * @param id
     * @param no_activate
     * @returns {boolean}
     */
    let setContent = function (id, no_activate) {
        let block = local.content.find('#' + id + '.tab-content-item[rel=' + local.config.tab_id + ']').eq(0);
        if (!no_activate) {
            block.addClass('active');
        }
        if (block.hasClass('complete')) {
            return true;
        }
        block.addClass('complete');
        let content = local.config.items[id].content;
        let content_type = typeof content;
        switch (content_type) {
            case 'function':
                content(block);
                break;
            default:
                block.append(content);
                break;
        }
    };
    /**
     * добавим калбеки
     */
    let addListener = function () {
        local.header.undelegate('.tab-header-item[rel=' + local.config.tab_id + ']', 'click').delegate('.tab-header-item[rel=' + local.config.tab_id + ']', 'click', function () {
            if ($(this).hasClass('active')) {
                return false;
            }
            local.header.find('.active.tab-header-item[rel=' + local.config.tab_id + ']').eq(0).removeClass('active');
            local.content.find('.active.tab-content-item[rel=' + local.config.tab_id + ']').eq(0).removeClass('active');
            let id = $(this).attr('id');
            $(this).addClass('active');
            if (typeof local.config.items[id].callback == 'function') {
                local.config.items[id].callback(local);
            }
            if (local.config.items[id].other) {
                id = local.config.items[id].other;
            }
            setContent(id);
        });
        local.header.undelegate('.full-size[rel=' + local.config.tab_id + ']', 'click').delegate('.full-size[rel=' + local.config.tab_id + ']', 'click', function () {
            let not = $(this).hasClass('not');
            switch (not) {
                case true:
                    $(this).switchClass('not', 'yes');
                    local.config.full = true;
                    break;
                case false:
                    local.config.full = false;
                    $(this).switchClass('yes', 'not');
                    break;
            }
            local.config.resize(local.config.full);
        });
    };
    /** constructor */
    init(config);
    /** public */
    return {
        html: function () {
            return local.body;
        },
        setContent: setContent
    };
});