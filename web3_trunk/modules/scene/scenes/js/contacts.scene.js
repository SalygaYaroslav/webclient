/**
 * сцена контакты
 * @type {Function}
 */
Scene.contacts = (function (template) {
    /** private */
    let local = {
        template: template,
        scene: null,
        groups_list: null,
        contacts_list: null,
        info_block: null,
        // project array
        group_array: [],
        contact_array: [],
        selected_group_id: null,
        selected_contact_id: null
    };
    /** public */
    return {
        /**
         * инициализация
         * @returns {Scene.contacts}
         */
        init: function () {
            this.render();
            this.changeParams(Router.getParams());
            return this;
        },
        /**
         * прорисовка
         */
        render: function () {
            local.template.empty().append(Template.render('scene', 'contacts/scene'));
            local.scene = $('.contacts-scene', local.template);
            local.groups_list = $('.groups-list', local.template);
            local.contacts_list = $('.contacts-list', local.template);
            local.info_block = $('.info-block', local.template);
            this.addListener();
        },
        /**
         * прорисовка групп
         */
        drawGroups: function () {
            let org = OrganizationBlock.getCurrentOrganization();
            let groups = local.group_array = org.getContactsGroup();
            // удалим элемнт данных о том, что мы смотрим другой уровень
            local.scene.removeClass('contact-lvl').removeClass('info-lvl');
            // sort
            groups.sort(function (a, b) {
                let a_name = a.getName().toLowerCase();
                let b_name = b.getName().toLowerCase();
                if (a_name < b_name) {
                    return -1;
                }
                if (a_name > b_name) {
                    return 1;
                }
                return 0;
            });
            for (let i = 0; i < groups.length; i++) {
                let group = groups[i];
                $(Template.render('scene', 'contacts/group_squire', {
                    name: group.getName(),
                    id: group.getId()
                })).appendTo(local.groups_list);
            }
        },
        /**
         * прорисовка контактов
         * @param group_id
         * @param callback
         */
        drawContacts: function (group_id, callback) {
            // очистим список старых задач
            local.contact_array = [];
            // очистим блок
            local.contacts_list.empty();
            // удалим элемнт данных о том, что мы смотрим другой уровень
            local.scene.removeClass('info-lvl');
            local.scene.addClass('contact-lvl');
            let group = Dataset.get('project',group_id);
            group.getTasks(function (contacts) {
                local.contact_array = contacts;
                // sort
                contacts.sort(function (a, b) {
                    let a_name = (a.getName() || '').toLowerCase();
                    let b_name = (b.getName() || '').toLowerCase();
                    if (a_name < b_name) {
                        return -1;
                    }
                    if (a_name > b_name) {
                        return 1;
                    }
                    return 0;
                });
                for (let i = 0; i < contacts.length; i++) {
                    let contact = contacts[i];
                    $(Template.render('scene', 'contacts/squire', {
                        name: contact.getName(),
                        id: contact.getId()
                    })).appendTo(local.contacts_list);
                }
                if (typeof callback == 'function') {
                    callback();
                }
            });
        },
        /**
         * добавим триггеры
         */
        addListener: function () {
            local.groups_list.undelegate('.contact-group-squire', 'click').delegate('.contact-group-squire', 'click', function () {
                Router.changeParams([$(this).attr('id')]);
            });
            local.contacts_list.undelegate('.contact-squire', 'click').delegate('.contact-squire', 'click', function () {
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
            this.unSelectContact(local.selected_contact_id);
            this.drawGroupTabs(id);
            if (id != local.selected_group_id) {
                $('.contact-group-squire.selected', local.groups_list).removeClass('selected').switchClass('to-right', 'to-bottom');
                local.selected_group_id = id;
                local.selected_contact_id = null;
                local.groups_list.find('#' + id).eq(0).addClass('selected').switchClass('to-bottom', 'to-right');
                this.drawContacts(local.selected_group_id, callback);
            } else {
                if (typeof callback == 'function') {
                    callback();
                }
            }
        },
        /**
         * выбор контакта
         * @param id
         * @param callback
         */
        selectContact: function (id, callback) {
            if (id != local.selected_contact_id) {
                this.unSelectContact(local.selected_contact_id);
                local.selected_contact_id = id;
                local.contacts_list.find('#' + id).eq(0).addClass('selected').addClass('to-right');
                this.drawContactTabs(local.selected_contact_id);
            }
        },
        /**
         * снять выбор с контакта
         * @param contact_id
         */
        unSelectContact: function (contact_id) {
            $('.contact-squire#' + contact_id, local.contacts_list).removeClass('selected').removeClass('to-right');
            local.selected_contact_id = null;
        },
        /**
         * прорисуем табуляторы для контакта
         * @param contact_id
         */
        drawContactTabs: function (contact_id) {
            local.info_block.empty().show();
            let lang = Lang.get();
            let tabs = new Tabs({
                tab_id: 'contact_info_' + contact_id,
                items: {
                    info: {
                        title: lang['scene']['tab']['info'],
                        content: ''
                    }
                }
            });
            local.info_block.append(tabs.html());
        },
        /**
         * прорисуем табуляторы для группы
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
         * перезагрузка
         */
        reload: function () {
            // обнулим
            local.selected_group_id = null;
            local.selected_contact_id = null;
            // рисуем
            Router.changeParams([]);
            this.render();
            this.drawGroups();
        },
        /**
         * снять бинды со сцены
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
                            self.selectContact(params[1]);
                        });
                        break;
                    case 3:
                        break;
                }
            }
        }
    };
});