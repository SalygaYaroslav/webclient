/**
 * сцена контакты
 * @type {Function}
 */
Scene.crm = (function (template) {
    /** private */
    let local = {
        template: template,
        scene: null,
        crm_list: null,
        table_list: null,
        info_block: null,
        selected_crm_id: null,
        crm: null,
        table: null
    };
    /** public */
    return {
        /**
         * инициализация
         * @returns {Scene.contacts}
         */
        init: function () {
            this.render();
            return this;
        },
        /**
         * прорисовка
         */
        render: function () {
            local.template.empty().append(Template.render('scene', 'crm/scene'));
            local.scene = $('.crm-scene', local.template);
            local.crm_list = $('.crm-list', local.template);
            local.table_list = $('.table-list', local.template);
            local.info_block = $('.info-block', local.template);
            this.addListener();
            this.changeParams(Router.getParams());
        },
        /**
         * перезагрузка
         */
        reload: function () {
            local.table_list.css('left', '25%');
            local.selected_crm_id = null;
            local.crm = null;
            local.table = null;
            Router.changeParams([]);
            this.drawCrms();
        },
        /**
         * прорисовка списка
         */
        drawCrms: function (callback) {
            // очистим блок
            local.crm_list.empty();
            local.table_list.empty().hide();
            let org = OrganizationBlock.getCurrentOrganization();
            let complete = function (local_crm) {
                let list = local_crm.list();
                // удалим элемнт данных о том, что мы смотрим другой уровень
                local.scene.removeClass('table-lvl').removeClass('info-lvl');
                for (let i = 0; i < list.length; i++) {
                    let crm = list[i];
                    $(Template.render('scene', 'crm/squire', {
                        name: crm['vcName'],
                        id: crm['id']
                    })).appendTo(local.crm_list).data('object', crm);
                }
                if (typeof  callback == 'function') {
                    callback();
                }
            };
            if (local.crm == null) {
                local.crm = new List.Crm(org.getId(), true);
                local.crm.load(function () {
                    local.crm.sortByName();
                    complete(local.crm);
                })
            } else {
                complete(local.crm);
            }
        },
        /**
         * добавим триггеры
         */
        addListener: function () {
            local.crm_list.undelegate('.crm-squire', 'click').delegate('.crm-squire', 'click', function () {
                Router.changeParams([$(this).attr('id')]);
            });
        },
        /**
         * выбор группы
         * @param id
         * @param callback
         */
        selectCrm: function (id, callback) {
            let self = this;
            if (id != local.selected_crm_id) {
                $('.crm-squire.selected', local.crm_list).removeClass('selected').switchClass('to-right', 'to-bottom');
                local.selected_crm_id = id;
                let el = local.crm_list.find('#' + local.selected_crm_id).eq(0);
                el.addClass('selected').switchClass('to-bottom', 'to-right');
                // render crm
                self.drawTableTabs($(el).data('object'));
            } else {
                if (typeof callback == 'function') {
                    callback();
                }
            }
        },
        /**
         *
         * @param crm
         */
        drawTableTabs: function (crm) {
            let self = this;
            local.table_list.empty().show();
            let lang = Lang.get();
            let tabs = new Tabs({
                tab_id: 'crm_table_' + local.selected_crm_id,
                full: true,
                items: {
                    table: {
                        title: crm['vcName'],
                        content: function (block) {
                            self.drawTable(block);
                        }
                    },
                    params: {
                        title: 'Структура таблицы',
                        content: function (block) {
                            self.drawTableParams(block);
                        }
                    }
                },
                resize: function (full) {
                    switch (full) {
                        case true:
                            local.table_list.css('left', '0');
                            break;
                        case false:
                            local.table_list.css('left', '25%');
                            break;
                    }
                }
            });
            local.table_list.append(tabs.html());
        },
        /**
         *
         * @param block
         */
        drawTable: function (block) {
            let table = new Crm.Table(local.selected_crm_id, {
                beforeData: function () {
                    BBlock.getButtonFromCollection('edit_field').rights = false;
                    BBlock.getButtonFromCollection('remove_field').rights = false;
                },
                selectRecord: function () {
                    BBlock.getButtonFromCollection('edit_field').rights = local.table.getAccessTo('edit');
                    BBlock.getButtonFromCollection('remove_field').rights = local.table.getAccessTo('delete');
                },
                afterDeleteRecord: function () {
                    BBlock.getButtonFromCollection('remove_field').rights = false;
                    BBlock.getButtonFromCollection('edit_field').rights = false;
                },
                isSearch: function (status) {
                    BBlock.getButtonFromCollection('clear_search').rights = status;
                }
            });
            table.loadStructure(function () {
                local.table = table;
                BBlock.getButtonFromCollection('new_field').rights = local.table.getAccessTo('add');
                local.table.build(block);
            })
        },
        drawTableParams: function (block) {
            let self = this;
            if (local.table) {
                block.append(local.table.buildParams());
            } else {
                setTimeout(function () {
                    self.drawTableParams(block);
                }, 100);
            }
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
            let buttons = {
                'add_table': {
                    id: 'add_table',
                    title: 'Новая таблица',
                    icon: 'Добавить',
                    rights: function () {
                        return OrganizationBlock.getCurrentOrganization().isEditable();
                    }(),
                    callback: function () {
                    }
                },
                'remove_table': {
                    id: 'remove_table',
                    title: 'Удалить таблицу',
                    icon: 'Удалить',
                    rights: function () {
                        return OrganizationBlock.getCurrentOrganization().isEditable();
                    }(),
                    callback: function () {

                    }
                },
                'new_field': {
                    id: 'new_field',
                    title: 'Новая запись',
                    icon: 'Добавить',
                    rights: false,
                    callback: function () {
                        local.table.editRecord();
                    }
                },
                'remove_field': {
                    id: 'remove_field',
                    title: 'Удалить записи',
                    icon: 'Удалить',
                    rights: false,
                    callback: function () {
                        local.table.removeRecords();
                    }
                },
                'edit_field': {
                    id: 'edit_field',
                    title: 'Редактировать запись',
                    icon: 'Редактировать',
                    rights: false,
                    callback: function () {
                        let current = local.table.getCurrentRecord();
                        local.table.editRecord(current.id, current.index);
                    }
                },
                'clear_search': {
                    id: 'clear_search',
                    title: 'Очистить поиск',
                    icon: 'Очистить-поиск',
                    rights: false,
                    callback: function () {
                        local.table.clearSearch();
                    }
                },

            };
            let self = this;
            if (typeof params != 'undefined') {
                switch (params.length) {
                    case 0:
                        BBlock.appendCollection([
                            buttons.add_table
                        ]);
                        self.drawCrms();
                        break;
                    case 1:
                        let scene_buttons = [
                            buttons.add_table,
                            buttons.remove_table,
                            'empty',
                            buttons.new_field,
                            buttons.remove_field,
                            buttons.edit_field,
                            buttons.clear_search

                        ];
                        if (scene_buttons[0].rights == false && scene_buttons[1].rights == false) {
                            scene_buttons.cleanByIndex(2);
                        }
                        BBlock.appendCollection(scene_buttons);
                        self.drawCrms(function () {
                            self.selectCrm(params[0]);
                        });
                        break;
                    case 2:

                        break;
                }
            }
        }
    };
});