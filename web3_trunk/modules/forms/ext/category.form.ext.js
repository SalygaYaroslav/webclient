Forms.Category = function (comment) {
    let local = {
        comment: comment || null,
        window: null,
        template: null
    };
    let self = {
        /**
         * построим
         */
        build: function () {
            let lang = Lang.get()['forms']['category'];
            local.window = new Windows({
                id: 'comment_category_' + comment.getId(),
                title: lang['title'],
                sizes: {
                    height: '400px',
                    width: '500px'
                },
                buttons: {
                    save: {
                        title: lang['save'],
                        callback: function (win) {
                            win.loading(true);
                            self.send(function () {
                                win.loading();
                                win.hide();
                            });
                        },
                        additional_class: '--full --right'
                    },
                    cancel: {
                        title: lang['cancel'],
                        callback: function (win) {
                            win.hide();
                        },
                        additional_class: '--empty --right'
                    }
                },
                content: function () {
                    let form = local.template = $('<div class="form --category">');
                    /** set tabs */
                    let tabs = new Tabs({
                        tab_id: 'category_change_' + local.comment.getId(),
                        items: {
                            category: {
                                title: lang['category'],
                                content: function (block) {
                                    self.renderCategory(block);
                                    setTimeout(function () {
                                        let block = $('.category-list', local.template);
                                        let current_category = local.comment.getCategoryColor();
                                        if (current_category) {
                                            let current = block.find('#' + current_category.id).eq(0).trigger('click');
                                            block.scrollTo(current, {offset: -60});
                                        } else {
                                            block.find('#0').eq(0).trigger('click');
                                            block.scrollTo('top');
                                        }
                                    }, 100);
                                },
                                callback: function (data) {
                                }
                            },
                            history: {
                                title: lang['history'],
                                content: function (block) {
                                    self.renderHistory(block);
                                },
                                callback: function (data) {
                                }
                            }
                        }
                    });
                    form.append(tabs.html());
                    tabs.setContent('category');
                    return form;
                },
                no_scroll: false
            }).show();
        },
        /**
         * прорисовка блока категории
         * @param parent
         */
        renderCategory: function (parent) {
            /** list */
            let list = new List.Categories(OrganizationBlock.getCurrentOrganization().getId());
            list.addDefault();
            list.sortByName();
            let items = list.list();
            let categories = [];
            for (let i = 0; i < items.length; i++) {
                let category = items[i];
                categories.push({
                    id: category.getId(),
                    text: category.getName(),
                    color: category.getColor()
                });
            }
            /** render template */
            local.template = $(Template.render('forms', 'category/category_list_form', {
                items: categories
            })).appendTo(parent);
            /** search */
            $('.category-search', local.template).append(Elements.searchInput('category-search', function (val, input) {
                switch (val) {
                    case '':
                        $('.category-item', local.template).show();
                        break;
                    default:
                        $('.category-item', local.template).hide();
                        $('.category-item:multilang(' + val + ')', local.template).show();
                        break;
                }
            }));
            /** select list */
            let block = $('.category-list', local.template);
            block.delegate('.category-item', 'click', function () {
                block.find('.active').eq(0).removeClass('active');
                $(this).addClass('active');
            });

        },
        /**
         * прорисовка блока истории
         * @param parent
         */
        renderHistory: function (parent) {
            let id = local.comment.getId();
            let xml = Request.commentGetCategoryHistory(id).xml();
            let data = [];
            $('comment_history', xml).each(function (i, item) {
                let date = moment(Tool.decode($('date', item).text()), 'YYYY-MM-DD HH:mm:ss');
                data.push({
                    dt: date,
                    date: date.calendar(),
                    author: Tool.decode($('user', item).text()),
                    category: Tool.decode($('cat_title', item).text())
                });
            });
            data.sort(function (first, second) {
                let first_value = first.dt;
                let second_value = second.dt;
                if (first_value.isAfter(first_value)) {
                    return -1;
                } else if (first_value.isBefore(second_value)) {
                    return 1;
                } else {
                    return 0;
                }
            });
            let lang = Lang.get()['forms']['category'];
            let table = new Table('category_history_' + id, {
                date: lang['date'],
                author: lang['author'],
                category: lang['category']
            }, data);
            parent.append(table.html());
        },
        /**
         * получим контент
         * @returns {null}
         */
        html: function () {
            return local.template;
        },
        /**
         * отправим на сервер
         * @param callback
         */
        send: function (callback) {
            comment.changeCategory($('.category-list > .active', local.template).eq(0).attr('id'), function () {
                callback();
            });
        },
        /**
         * перезагрузим
         */
        reload: function () {

        }
    };
    self.build();
    return self;
};