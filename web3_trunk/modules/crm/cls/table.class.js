/**
 *
 * @param id
 * @param callbacks
 * @returns {{loadStructure: loadStructure, build: build, setCustomArray: setCustomArray, getData: getData, setNavigation: setNavigation, getSelectedRecords: getSelectedRecords, getAccessTo: getAccessTo, removeRecords: removeRecords}}
 * @constructor
 */
Crm.Table = function (id, callbacks) {
    let local = {
        id: id,
        entity: null,
        vue: null,
        template: null,
        section: 1,
        load: false,
        searchTimeout: null,
        callbacks: callbacks || {}
    };
    return {
        /**
         *
         * @param callback
         */
        loadStructure: function (callback) {
            Request.getCrmStructure(local.id, function (data) {
                let xml = data.xml();
                local.entity = new Crm.Structure($('news > crmstructures > crmstructure', xml)[0]).create();
                callback(local.entity.getArrayOfFields());
            });
        },
        build: function (parent) {
            let self = this;
            let order_data = local.entity.getOrder();
            // load template
            local.template = $('<crm-table ' +
                'v-bind:thead="thead" ' +
                'v-bind:tfoot="tfoot" ' +
                'v-bind:tbody="tbody" ' +
                'v-bind:thidden="thidden" ' +
                'v-bind:pagination="pagination" ' +
                'v-on:thead-click="theadClick" ' +
                'v-on:pagination_click="paginationClick" ' +
                'v-on:pagination_page_click="paginationPageClick" ' +
                'v-on:limit_click="limitClick" ' +
                'v-on:select_tr="selectTr" ' +
                'v-on:dbl_select_tr="dblSelectTr" ' +
                '></crm-table>').appendTo(parent);
            local.vue = new Vue({
                el: local.template[0],
                data: {
                    thead: local.entity.getThead(),
                    tfoot: local.entity.getTfoot(),
                    tbody: [],
                    thidden: [],
                    current_order_index: order_data.index,
                    pagination: {},
                    previous_select: {id: null, index: null}
                },
                methods: {
                    theadClick: function (index) {
                        if (this.thead[index].sorted == true) {
                            switch (this.thead[index].order) {
                                case '':
                                    if (typeof this.thead[this.current_order_index] != 'undefined') {
                                        this.thead[this.current_order_index].order = '';
                                    }
                                    this.thead[index].order = 'd';
                                    break;
                                case 'd':
                                    this.thead[index].order = 'a';
                                    break;
                                case 'a':
                                    this.thead[index].order = 'd';
                                    break;
                            }
                            this.current_order_index = index;
                            let data = {
                                id: this.thead[index].id,
                                order: this.thead[index].order
                            };
                            local.entity.filter(data, function () {
                                self.getData();
                            });
                        }
                    },
                    paginationPageClick: function (item) {
                        if (item.selected != true) {
                            self.getData(item.value);
                        }
                    },
                    paginationClick: function (value) {
                        self.getData(value);
                    },
                    limitClick: function (item) {
                        if (item.selected == false) {
                            Crm.limitFieldsByPage(item.value);
                            self.getData();
                        }
                    },
                    selectTr: function (event, index, id) {
                        switch (true) {
                            case event.shiftKey:
                                let start, end;
                                if (this.previous_select.index < index) {
                                    start = this.previous_select.index;
                                    end = index;
                                } else {
                                    start = index;
                                    end = this.previous_select.index;
                                }
                                for (let i = start; i <= end; i++) {
                                    this.tbody[i].selected = true;
                                }
                                break;
                            case event.ctrlKey:
                                this.tbody[index].selected = true;
                                break;
                            default:
                                for (let i = 0; i < this.tbody.length; i++) {
                                    this.tbody[i].selected = false;
                                }
                                this.tbody[index].selected = true;
                                break;
                        }
                        this.previous_select = {id: id, index: index};
                        this.thidden = this.tbody[index].td;
                        if (typeof local.callbacks['selectRecord'] == 'function') {
                            local.callbacks['selectRecord'](event, index, id);
                        }
                    },
                    dblSelectTr: function (event, index, id) {
                        self.editRecord(id, index);
                    }
                }
            });
            $(local.vue.$el).find('.crm-tfoot').undelegate('input', 'keyup').delegate('input', 'keyup', function () {
                let id = $(this).parents('.crm-th').eq(0).attr('id');
                self.setSearchData(id, $(this).val());
            });
            $(local.vue.$el).find('.crm-tfoot').undelegate('select', 'change').delegate('select', 'change', function () {
                let id = $(this).parents('.crm-th').eq(0).attr('id');
                self.setSearchData(id, $(this).val());
            });
            // $(local.vue.$el).find('.crm-tfoot').find('select').selectize();
            self.getData(1);
        },
        setCustomArray: function (array) {
            local.entity.setCustomArray(array);
        },
        getData: function (section) {
            // очистим таймаут поиска, вдруг уже попробовали ввести
            if (local.searchTimeout) {
                clearTimeout(local.searchTimeout);
            }
            local.load = true;
            let self = this;
            Interface.Load.show('Загрузка данных', $('.crm-loading', local.vue.$el));
            if (typeof local.callbacks['beforeData'] == 'function') {
                local.callbacks['beforeData']();
            }
            local.entity.getData(section, function (data) {
                if (typeof local.callbacks['afterData'] == 'function') {
                    local.callbacks['afterData']();
                }
                local.vue.previous_select = {id: null, index: null};
                local.vue.thidden = [];
                local.vue.tbody = data;
                self.setNavigation();
                local.load = false;
                Interface.Load.hide();
            });
        },
        setNavigation: function () {
            local.vue.pagination = local.entity.getNavigation();
        },
        getCurrentRecord: function () {
            return local.vue.previous_select;
        },
        getSelectedRecords: function () {
            let selected = [];
            for (let i = 0; i < local.vue.tbody.length; i++) {
                if (local.vue.tbody[i].selected) {
                    selected.push(local.vue.tbody[i].id);
                }
            }
            return selected;
        },
        getAccessTo: function (type) {
            let result = true;
            switch (type) {
                case 'delete':
                    if (local.entity.getAccess('disable_deletion') == '1') {
                        result = false;
                    } else {
                        result = local.entity.checkAccess(type);
                    }
                    break;
                case 'add':
                    result = local.entity.checkAccess(type);
                    break;
            }
            return result;
        },
        removeRecords: function (records) {
            let self = this;
            if (typeof records == 'undefined') {
                records = self.getSelectedRecords();
            }
            local.entity.removeRecords(records, function () {
                if (typeof local.callbacks['afterDeleteRecord'] == 'function') {
                    local.callbacks['afterDeleteRecord']();
                }
                self.getData();
            });
        },
        editRecord: function (record_id, index) {
            let self = this;
            let lang = Lang.get()['crm']['edit'];
            let type = 'update';
            let data = local.entity.getDataToForm(record_id, index);
            if (typeof record_id == 'undefined') {
                type = 'create';
            }

            let form = new TreeForm.Form(data, true);
            let content = form.render();
            new Windows({
                id: 'edit_record_' + local.entity.getId(),
                title: lang[type],
                sizes: {
                    height: '80%',
                    width: '80%'
                },
                buttons: {
                    save: {
                        title: lang['save'],
                        callback: function (win) {
                            form.getFormData(function (form_data) {
                                if (typeof record_id != 'undefined') {
                                    form_data['id'] = record_id;
                                }
                                win.loading(true);
                                local.entity.sendRecordData(type, form_data, function () {
                                    win.loading();
                                    win.hide();
                                    self.getData();
                                });
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
                content: content,
                no_scroll: false
            }).show();
        },
        buildParams: function () {
            let edit_structure = local.entity.getEditStructure()
            let template = $('<crm-params v-bind:list="list" v-bind:selected="selected" v-on:select="select" v-on:edit-row="editRow"></crm-params>');
            let vue = new Vue({
                el: template[0],
                data: {
                    list: edit_structure.getListOfParams(),
                    selected: ''
                },
                methods: {
                    select: function (id) {
                        this.selected = id;
                    },
                    editRow: function (id) {
                        edit_structure.drawEditTable(id);
                    }
                }
            });
            $('.crm-params-list-items', vue.$el).sortable({
                placeholder: 'crm-params-list-items-drop',
                axis: 'y'
            });
            return vue.$el;
        },
        setSearchData: function (row_id, value) {
            let self = this;
            local.entity.setSearchData(row_id, value, function (search_string, reason) {
                if (typeof local.callbacks['isSearch'] == 'function') {
                    local.callbacks['isSearch'](search_string.length > 0);
                }
                if (reason == true) {
                    if (local.searchTimeout) {
                        clearTimeout(local.searchTimeout);
                    }
                    local.searchTimeout = setTimeout(function () {
                        self.getData();
                    }, 500);
                }
            });
        },
        clearSearch: function () {
            local.entity.clearSearch();
            if (typeof local.callbacks['isSearch'] == 'function') {
                local.callbacks['isSearch'](false);
            }
            $(local.vue.$el).find('.crm-tfoot').find('input').each(function () {
                $(this).val('');
            });
            $(local.vue.$el).find('.crm-tfoot').find('select').each(function () {
                $(this).val('#empty');
            });
            this.getData(1);
        }
    };
};