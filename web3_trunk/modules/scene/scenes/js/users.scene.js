/**
 * сцена пользователей
 * @type {Function}
 */
Scene.users = (function (template) {
    /** private */
    let local = {
        template: template,
        scene: null,
        groups_list: null,
        users_list: null,
        info_block: null,
        // project array
        group_array: [],
        user_array: [],
        selected_group_id: null,
        selected_user_id: null
    };
    /** public */
    return {
        /**
         * инициализация
         * @returns {Scene.users}
         */
        init() {
            this.render();
            this.changeParams(Router.getParams());
            return this;
        },
        /**
         * прорисовка
         */
        render: function () {
            local.template.empty().append(Template.render('scene', 'users/scene'));
            local.scene = $('.users-scene', local.template);
            local.groups_list = $('.groups-list', local.template);
            local.users_list = $('.users-list', local.template);
            local.info_block = $('.info-block', local.template);
            this.addListener();
        },
        /**
         * рисуем группы
         */
        drawGroups: function () {
            let org = OrganizationBlock.getCurrentOrganization();
            let groups = new List.UserGrops(org.getId());
            // удалим элемнт данных о том, что мы смотрим другой уровень
            local.scene.removeClass('user-lvl').removeClass('info-lvl');
            // sort
            groups.sortByName();
            let group_list = groups.list();
            for (let i = 0; i < group_list.length; i++) {
                let group = group_list[i];
                $(Template.render('scene', 'users/group_squire', {
                    name: group.getName(),
                    id: group.getId()
                })).appendTo(local.groups_list);
            }
        },
        /**
         * рисуем пользователей
         * @param group_id
         * @param callback
         */
        drawUsers: function (group_id, callback) {
            // очистим список старых задач
            local.user_array = [];
            // очистим блок
            local.users_list.empty();
            // удалим элемнт данных о том, что мы смотрим другой уровень
            local.scene.removeClass('info-lvl');
            local.scene.addClass('user-lvl');

            let users = List.Users(group_id);
            users.sortByName();
            let users_list = users.list();
            for (let i = 0; i < users_list.length; i++) {
                let user = users_list[i];
                $(Template.render('scene', 'users/squire', {
                    name: user.getName(),
                    id: user.getId()
                })).appendTo(local.users_list);
            }
            if (typeof callback == 'function') {
                callback();
            }
        },
        /**
         * добавим калбеки
         */
        addListener: function () {
            local.groups_list.undelegate('.group-squire', 'click').delegate('.group-squire', 'click', function () {
                Router.changeParams([$(this).attr('id')]);
            });
            local.users_list.undelegate('.user-squire', 'click').delegate('.user-squire', 'click', function () {
                Router.changeParams([local.selected_group_id, $(this).attr('id')]);
            });
        },
        /**
         * выбор группы
         * @param id
         * @param callback
         */
        selectGroup: function (id, callback) {
            if (local.groups_list.is(':empty')) {
                this.drawGroups();
            }
            this.unSelectUser(local.selected_user_id);
            this.drawGroupTabs(local.selected_group_id);
            if (id != local.selected_group_id) {
                $('.group-squire.selected', local.groups_list).removeClass('selected').switchClass('to-right', 'to-bottom');
                local.selected_group_id = id;
                local.selected_user_id = null;
                local.groups_list.find('#' + id).eq(0).addClass('selected').switchClass('to-bottom', 'to-right');
                this.drawUsers(local.selected_group_id, callback);
            } else {
                if (typeof callback == 'function') {
                    callback();
                }
            }
        },
        /**
         * выбор юзера
         * @param id
         * @param callback
         */
        selectUser: function (id, callback) {
            if (id != local.selected_user_id) {
                this.unSelectUser(local.selected_user_id);
                local.selected_user_id = id;
                local.users_list.find('#' + id).eq(0).addClass('selected').addClass('to-right');
                this.drawUserTabs(local.selected_user_id);
            } else {
                if (typeof callback == 'function') {
                    callback();
                }
            }
        },
        /**
         * снятие выбора с юзера
         * @param user_id
         */
        unSelectUser: function (user_id) {
            $('.user-squire#' + user_id, local.users_list).removeClass('selected').removeClass('to-right');
            local.selected_user_id = null;
        },
        /**
         * прорисуем табулятор юзера
         * @param user_id
         */
        drawUserTabs: function (user_id) {
            local.info_block.empty().show();
            let lang = Lang.get();
            let tabs = new Tabs({
                tab_id: 'user_info_' + user_id,
                items: {
                    info: {
                        title: lang['scene']['tab']['info'],
                        content: function (block) {
                            let user = Dataset.get('user',local.selected_user_id);
                            let editable = user.isEditable();
                            let tree_form = TreeForm.getTreeForm('user', function (config) {
                                return user.getDataToForm(config);
                            }, editable);
                            $('<div class="form-info full-wh ' + ((editable) ? 'editable' : '') + '"></div>').append(tree_form.render()).appendTo(block);
                            let button_save = new Elements.button('user_form_save', 'save', 'user_form --full --right');
                            let button_cancel = new Elements.button('user_form_save', 'cancel', 'user_form --empty --right');
                            if (editable) {
                                $('<div class="form-button"></div>').append(button_save).append(button_cancel).appendTo(block);
                            }
                            button_save.on('click', function () {
                                Interface.Load.show('Обработка данных', block);
                                tree_form.getFormData(function (data) {
                                    user.saveEntityToServer(data, function () {
                                        Interface.Load.hide();
                                        $('.form-info', block).empty();
                                        tree_form = TreeForm.getTreeForm('user', user.getDataToForm, editable);
                                        $('.form-info', block).append(tree_form.render());
                                        Notice.notify('Данные изменены');
                                    });
                                });
                            });
                        }
                    },
                    chat: {
                        title: lang['scene']['tab']['chat'],
                        content: ''
                    },
                    job: {
                        title: lang['scene']['tab']['job'],
                        content: ''
                    }
                }
            });
            local.info_block.append(tabs.html());
        },
        /**
         * прорисуем табулятор группы
         * @param group_id
         */
        drawGroupTabs: function (group_id) {
            local.info_block.empty().show();
            let lang = Lang.get();
            let tabs = new Tabs({
                tab_id: 'group_info_' + group_id,
                items: {
                    info: {
                        title: lang['scene']['tab']['info'],
                        content: ''
                    },
                    access: {
                        title: lang['scene']['tab']['access'],
                        content: ''
                    }
                }
            });
            local.info_block.append(tabs.html());
        },
        /**
         * перегрузим
         */
        reload: function () {
            let self = this;
            // обнулим
            local.selected_group_id = null;
            local.selected_user_id = null;
            // рисуем
            Router.changeParams([]);
            self.render();
            self.drawGroups();
        },
        /**
         * снятие калбеков
         * @param callback
         */
        unbindScene: function (callback) {
            callback();
        },
        /**
         * смена параметров
         * @param params
         */
        changeParams: function (params) {
            let self = this;
            if (typeof params != 'undefined') {
                switch (params.length) {
                    case 0:
                        self.reload();
                        break;
                    case 1:
                        self.selectGroup(params[0]);
                        break;
                    case 2:
                        self.selectGroup(params[0], function () {
                            self.selectUser(params[1]);
                        });
                        break;
                    case 3:
                        break;
                }
            }
        }
    };
});