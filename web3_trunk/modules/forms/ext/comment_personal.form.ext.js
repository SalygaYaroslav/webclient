Forms.CommentPersonal = function (data, callback) {
    let local = {
        data: data || null,
        callback: callback || function () {
        },
        tab_id: new Date().getTime(),
        window: null,
        template: null
    };
    let self = {
        /**
         * построим
         */
        build: function () {
            let lang = Lang.get()['forms']['personal'];
            local.window = new Windows({
                id: 'comment_personal_' + local.tab_id,
                title: data.type != '2' ? lang['title'] : lang['title_second'],
                sizes: {
                    height: '70%',
                    width: '40%'
                },
                buttons: {
                    save: {
                        title: lang['save'],
                        callback: function (win) {
                            win.loading(true);
                            self.send(function (result) {
                                win.loading();
                                local.callback(result);
                                win.hide();
                            });
                        },
                        additional_class: '--full --right'
                    },
                    cancel: {
                        title: lang['close'],
                        callback: function (win) {
                            win.hide();
                        },
                        additional_class: '--empty --right'
                    }
                },
                content: function () {
                    local.template = $('<div class="form --personal full-wh">');
                    switch (data.type) {
                        case '0':
                        case '1':
                            return self.renderAssign(local.template);
                            break;
                        case '2':
                            return self.renderNotify(local.template);
                            break;
                    }
                },
                no_scroll: true,
                modal: true
            }).show();
        },
        /**
         *
         * @param parent
         */
        renderAssign: function (parent) {
            let table_block = $('<div class="personal_table_parent"></div>').appendTo(parent);
            let data = [];
            let users = local.data.list;
            for (let i = 0; i < users.length; i++) {
                let user = users[i];
                data.push({
                    _id: user.getId(),
                    user: user.getName(),
                    organization: function () {
                        let array = [];
                        let organizations = user.getUserOrganization();
                        for (let j = 0; j < organizations.length; j++) {
                            array.push(organizations[j].getName());
                        }
                        return array.join(', ');
                    }()
                });
            }
            data.sort(function (first, second) {
                let first_value = first.user.toLowerCase();
                let second_value = second.user.toLowerCase();
                if (first_value < second_value) {
                    return -1;
                } else if (first_value > second_value) {
                    return 1;
                } else {
                    return 0;
                }
            });
            let lang = Lang.get()['forms']['personal'];
            let table = new Table('users_in_org', {
                user: lang['user'],
                organization: lang['in_org']
            }, data);
            table_block.append(table.html());
            let radio = Elements.radio('personal_setting', [
                {text: lang['render_assign_all_task'], value: 'open'},
                {text: lang['render_assign_comment'], value: 'personal'}
            ], 'open');
            parent.append(radio);
            return parent;
        },
        /**
         *
         * @param parent
         */
        renderNotify: function (parent) {
            let template = $(Template.render('forms', 'comment/comment_personal_notify')).appendTo(parent);
            let table_block = $('.personal_table_parent', template);
            let data = [];
            let users = local.data.list;
            for (let i = 0; i < users.length; i++) {
                let user = users[i];
                data.push({
                    checkbox: Elements.checkbox(user.getId(), '', false)[0].outerHTML,
                    user: user.getName(),
                    organization: function () {
                        let array = [];
                        let organizations = user.getUserOrganization();
                        for (let j = 0; j < organizations.length; j++) {
                            array.push(organizations[j].getName());
                        }
                        return array.join(', ');
                    }()
                })
            }
            data.sort(function (first, second) {
                let first_value = first.user.toLowerCase();
                let second_value = second.user.toLowerCase();
                if (first_value < second_value) {
                    return -1;
                } else if (first_value > second_value) {
                    return 1;
                } else {
                    return 0;
                }
            });
            let lang = Lang.get()['forms']['personal'];
            let table = new Table('users_in_org', {
                checkbox: '',
                user: lang['user'],
                organization: lang['in_org']
            }, data);
            table_block.append(table.html());
            return parent;
        },
        /**
         * получим контент
         * @returns {null}
         */
        html: function () {
            return local.template;
        },
        /**
         * вернем
         * @param callback
         */
        send: function (callback) {
            switch (local.data.type) {
                case '0':
                    let data_assign_personal = {
                        list: {},
                        type: $('[name=personal_setting]:checked', local.template).val(),
                        personal: true
                    };
                    $('.table-body > .table-tr', local.template).each(function () {
                        let id_ = $(this).attr('id');
                        data_assign_personal.list = id_;
                    });
                    return callback(data_assign_personal);
                    break;
                case '1':
                    let data_assign = {
                        list: [],
                        type: $('[name=personal_setting]:checked', local.template).val()
                    };
                    $('.table-body > .table-tr', local.template).each(function () {
                        let id = $(this).attr('id');
                        data_assign.list.push(id);
                    });
                    return callback(data_assign);
                    break;
                case '2':
                    let data_notify = {
                        list: {}
                    };
                    $('input[type="checkbox"]', local.template).each(function () {
                        let id = $(this).attr('id').replace('checkbox__', '');
                        data_notify.list[id] = $(this).prop('checked');
                    });
                    return callback(data_notify);
                    break;
            }
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