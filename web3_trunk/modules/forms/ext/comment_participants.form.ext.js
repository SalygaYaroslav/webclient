Forms.CommentParticipants = function (data, callback) {
    let local = {
        data: data || null,
        callback: callback || function () {
        },
        tab_id: new Date().getTime(),
        window: null,
        template: null,
        participants: {
            users: [],
            contacts: []
        },
        tree: {
            users: null,
            contacts: null
        }
    };
    let self = {
        /**
         * построим
         */
        build: function () {
            let lang = Lang.get();
            local.window = new Windows({
                id: 'comment_participants_' + local.tab_id,
                title: lang['forms']['participants']['participants'],
                sizes: {
                    height: '70%',
                    width: '50%'
                },
                buttons: {
                    save: {
                        title: lang['forms']['participants']['save'],
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
                        title: lang['forms']['participants']['cancel'],
                        callback: function (win) {
                            win.hide();
                        },
                        additional_class: '--empty --right'
                    }
                },
                content: function () {
                    let form = local.template = $('<div class="form --participants">');
                    /** set tabs */
                    let tabs = new Tabs({
                        tab_id: 'participants_' + local.tab_id,
                        items: {
                            users: {
                                title: lang['forms']['participants']['users'],
                                content: function (block) {
                                    return self.renderUsers(block);
                                }
                            },
                            contacts: {
                                title: lang['forms']['participants']['contacts'],
                                content: function (block) {
                                    return self.renderContacts(block);
                                }
                            }
                        },
                        build: true
                    });
                    form.append(tabs.html());
                    tabs.setContent('users');
                    return form;
                },
                no_scroll: false
            }).show();
        },
        /**
         * прорисовка блока пользователей
         * @param parent
         */
        renderUsers: function (parent) {
            let tree = local.tree.users = Tree.allUsers(true, true);
            tree.appendTo(parent);
            let ids = [];
            for (let i = 0; i < local.data.users.length; i++) {
                let login = local.data.users[i];
                let id = Dataset.Tree.getUserByLogin(login).getId();
                ids.push('user_' + id);
            }
            tree.jstree(true).check_node(ids);
        },
        /**
         * прорисовка блока контактов
         * @param parent
         */
        renderContacts: function (parent) {
            let tree = local.tree.contacts = Tree.allContacts(true, true);
            tree.appendTo(parent);
            let ids = [];
            for (let i = 0; i < local.data.contacts.length; i++) {
                let login = local.data.contacts[i];
                ids.push('contact_' + login);
            }
            tree.jstree(true).check_node(ids);
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
            if (local.tree.users) {
                let users = local.tree.users.data('getSelected')();
                if (users.length > 0) {
                    for (let i = 0; i < users.length; i++) {
                        if (/user_/gi.test(users[i]) == true) {
                            let login = Dataset.get('user',users[i].replace('user_', '')).getLogin();
                            if (local.participants.users.indexOf(login) == '-1') {
                                local.participants.users.push(login);
                            }
                        }
                    }
                }
            }
            if (local.tree.contacts) {
                let contacts = local.tree.contacts.data('getSelected')();
                if (contacts.length > 0) {
                    for (let i = 0; i < contacts.length; i++) {
                        if (/contact_/gi.test(contacts[i]) == true) {
                            let contact = contacts[i].replace('contact_', '');
                            if (local.participants.contacts.indexOf(contact) == '-1') {
                                local.participants.contacts.push(contact);
                            }
                        }
                    }
                }
            }
            callback(local.participants);
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