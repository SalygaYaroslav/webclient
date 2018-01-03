Crm.Structure = function (xml) {
    let local = {
        xml: xml,
        custom_array_to_view: null,
        last_search_string: '',
        data: {
            id: null, // id таблицы
            object_id: null, // id проекта родителя
            organization_id: null,
            gantt: false,
            // данные
            structure: {
                rows: null,
                positions: null,
                visual: null,
                field_names: {},
                temp: null,
                lookup: {},
                show_numeric: false
            },
            filters: {},
            // пагинация
            pagination: {
                send: {
                    page: 1, // текущая страница
                    order: 'd', // направление
                    field: 'id', // поле сортировки
                    limit: 15, // лимит отображения
                    total: 0 // всего записей
                },
                limit_array: [15, 20, 50, 100],
                limit_chart: 40
            },
            find: {},
            // доступы
            access: {
                admin: null,
                users: null,
                columns: null,
                disable_deletion: '0'
            },
            // биллинг
            bill: {
                type: null,
                access: null
            },
            // параметры
            parameters: {
                created: null,
                modified: null,
                quota: null,
                used: null,
                oper_id: null,
                modifier_id: null
            }
        },
        values: []
    };
    return {
        create: function () {
            let self = this;
            self.prepare();
            self.additionalSettings();
            self.rowsXml();
            self.setAccess();
            return self;
        },
        prepare: function () {
            local.data.id = $(local.xml).children('id').text();
            local.data.object_id = ((parseInt(local.id) >= 1000000000) ? null : Dataset.get('task',local.id).getParentProject().getId());
            local.data.organization_id = $(local.xml).children('org_id').text();
        },
        getOrganization: function () {
            return Dataset.get('organization',local.data.organization_id);
        },
        additionalSettings: function () {
            try {
                let xml = $('crm-settings', Tool.stringToXml(Tool.decode($(local.xml).children('settings').text())));
                // пагинация
                local.data.pagination.send.limit = Crm.limitFieldsByPage();
                if (typeof $('default-sort', xml).attr('order') != 'undefined') {
                    local.data.pagination.send.order = ($('default-sort', xml).attr('order') == 'desc') ? 'd' : 'a';
                }
                if ($('default-sort', xml).length > 0) {
                    local.data.pagination.send.field = ($('default-sort', xml).text() != 'server_id') ? $('default-sort', xml).text() : 'id';
                }
                if ($('disable-deletion', xml).length > 0) {
                    local.data.access.disable_deletion = $('disable-deletion', xml).text() || '0';
                }
                if ($('row-numbering', xml).length > 0) {
                    local.data.structure.show_numeric = $('row-numbering', xml).text().toBoolean() || false;
                }
                // фильтры
                if (typeof $('filters', xml) != 'undefined') {
                    $('filters', xml).find('filter').each(function () {
                        let $t = $(this);
                        local.data.filters[$t.attr('id')] = {
                            t: $t.attr('title'),
                            f: $t.text()
                        };
                    });
                }
                // диаграмма ганта?
                if ($('gantt_table', xml).length > 0) {
                    local.data.gantt = true;
                }
            } catch (e) {
                console.log(e);
            }
        },
        rowsXml: function () {
            let self = this;
            try {
                let convert = Tool.decode($(local.xml).children('columns').text());
                // заглушка для ПИДОРГОВ (c) орфография сохранена с веб2 :D
                convert = convert.replace(/funnel="<date format="(.*?)"\/>"/gi, function (a, b) {
                    return 'funnel="' + '<date format="' + b + '"/>'.encode() + '"';
                });
                convert = convert.replace(/funnel="<lookup external-dialog="(.*?)"\/>"/gi, function (a, b) {
                    return 'funnel="' + '<lookup external-dialog="' + b + '"/>'.encode() + '"';
                });
                convert = convert.replace(/funnel="<expression precision="(.*?)"><\/expression>"/gi, function (a, b) {
                    return 'funnel="' + 'funnel="<expression precision="' + b + ')"><\/expression>"'.encode() + '"';
                });
                convert = convert.replace(/funnel="<settings>(.*)<\/settings>"/gi, function (a, b) {
                    return 'funnel="' + '<settings>' + b + '<\settings>'.encode() + '"';
                });
                let xml = Tool.stringToXml('<colums>' + convert + '</colums>');
                // обнулим лукап поля
                local.data.structure.lookup = {};
                // структура
                let structures = {};
                // обработка полей
                $('column', xml).each(function (index, item) {
                    let row = new Crm.Row(self, item).set();
                    let id = row.getId();
                    structures[id] = row;
                    local.data.structure.lookup = $.extend(local.data.structure.lookup, row.getLookup());
                    // field name
                    let field_name = row.getFieldName();
                    if (field_name) {
                        local.data.structure.field_names[field_name] = id;
                    }
                });
                local.data.structure.rows = structures;
                self.convertPosition();
                self.convertVisionPosition();
            } catch (e) {
                console.log(e);
            }
        },
        setAccess: function () {
            let xml = $(local.xml).children('accesses');
            local.data.access.users = {};
            local.data.access.columns = {};
            $('user', xml).each(function (i, item) {
                let acc = $(item).attr('accesses');
                if (acc && acc != '') {
                    acc = acc.split(',');
                } else {
                    acc = [];
                }
                local.data.access.users[$(item).attr('id')] = acc;
            });
            local.data.access.admin = $('admin', xml).text().toBoolean();
            local.data.access.adminp_group = $('admin_group', xml).text();
            let columns = $('columns', xml);
            local.data.access.columns['edit'] = $('edit', columns).text().split(',');
        },
        getId: function () {
            return local.data.id;
        },
        convertPosition: function () {
            let length = Object.keys(local.data.structure.rows).length;
            let lookup_length = 0;
            for (let id in local.data.structure.lookup) {
                if (local.data.structure.lookup[id] == true) {
                    lookup_length++;
                }
            }
            let positions = new Array(length - lookup_length);
            let error_position = [];

            for (let id in local.data.structure.rows) {
                if (local.data.structure.lookup[id] == false) {
                    let position = local.data.structure.rows[id].getPosition();
                    if (typeof positions[position] == 'undefined' && position < positions.length) {
                        positions[position] = id;
                    } else {
                        error_position.push(id);
                    }
                }
            }
            if (error_position.length > 0) {
                let k = 0;
                for (let j = 0; j < positions.length; j++) {
                    if (typeof positions[j] == 'undefined') {
                        positions[j] = error_position[k];
                        k++;
                    }
                }
            }
            for (let i = 0; i < positions.length; i++) {
                if (typeof positions[i] == 'undefined') {
                    positions.splice(i, 1);
                }
            }
            local.data.structure.positions = positions;
            return true;
        },
        convertVisionPosition: function () {
            let array = ['id'];
            for (let i = 0; i < local.data.structure.positions.length; i++) {
                let row = local.data.structure.rows[local.data.structure.positions[i]];
                array.push(local.data.structure.positions[i]);
                if (typeof row != 'undefined' && row.getType() == 'ftLookup' && row.getLookupFields(true) != "") {
                    let convert_lookup = row.getLookupFields();
                    if (typeof convert_lookup != 'undefined') {
                        let table_id = convert_lookup.tid;
                        let out_ids = convert_lookup.outids;
                        for (let j = 0; j < out_ids.length; j++) {
                            // сделаем проверку, пришло ли нам поле?
                            let tid_id = 't' + table_id + '.' + row.getId() + '.' + out_ids[j];
                            if (typeof local.data.structure.rows[tid_id] != 'undefined') {
                                local.data.structure.rows[tid_id].convertParentLookup(row.getId());
                                array.push(tid_id);
                            }
                        }
                    }
                }
            }
            local.data.structure.visual = array;
        },
        getRow: function (id) {
            return local.data.structure.rows[id];
        },
        getRowByFieldName: function (name) {
            if (local.data.structure.field_names[name]) {
                return local.data.structure.field_names[name];
            }
            return false;
        },
        getArrayOfFields: function () {
            return Object.keys(local.data.structure.rows);
        },
        setCustomArray: function (array) {
            local.custom_array_to_view = array;
        },
        getThead: function () {
            let self = this;
            let order_data = self.getOrder();
            let thead = [];
            if (local.data.structure.show_numeric) {
                thead.push({id: 'n', value: '№'});
            }
            let array = local.custom_array_to_view || local.data.structure.visual;
            for (let i = 0; i < array.length; i++) {
                let id = array[i];
                if (id == 'id') {
                    thead.push({
                        id: 'id',
                        value: 'Код',
                        hidden: true,
                        sorted: true,
                        order: order_data.id == 'id' ? order_data.order : ''
                    });
                } else {
                    let row = self.getRow(array[i]);
                    thead.push({
                        id: id,
                        hidden: !row.getVisible(),
                        value: row.getName(),
                        title: row.getName(),
                        sorted: row.getIsSorted(),
                        order: order_data.id == id ? order_data.order : ''
                    });
                }
            }
            return thead;
        },
        getTfoot: function () {
            let self = this;
            let order_data = self.getOrder();
            let tfoot = [];
            if (local.data.structure.show_numeric) {
                tfoot.push({id: 'n', value: ''});
            }
            let array = local.custom_array_to_view || local.data.structure.visual;
            for (let i = 0; i < array.length; i++) {
                let id = array[i];
                if (id == 'id') {
                    tfoot.push({
                        id: 'id',
                        hidden: true,
                        contain: '<input>'
                    });
                } else {
                    let row = self.getRow(array[i]);
                    tfoot.push({
                        id: id,
                        hidden: !row.getVisible(),
                        sortable: row.getIsSorted(),
                        data: row.getTfootData()
                    });
                }
            }
            return tfoot;
        },
        getTbody: function () {
            let body = [];
            for (let i = 0; i < local.values.length; i++) {
                let data = {id: local.values[i].id, td: [], selected: false};
                if (local.data.structure.show_numeric) {
                    data.td.push({
                        id: 'i',
                        val: (local.data.pagination.send.page - 1) * local.data.pagination.send.limit + 1 + i
                    });
                }
                let array = local.custom_array_to_view || local.data.structure.visual;
                for (let j = 0; j < array.length; j++) {
                    let id = array[j];
                    if (id == 'id') {
                        data.td.push({
                            hidden: true,
                            id: 'id',
                            val: local.values[i]['id'],
                            title: 'Код',
                        });
                    } else {
                        let value = '';
                        let row = local.data.structure.rows[id];
                        if (row.isSystem() == false) {
                            value = local.values[i].fields[id];
                        } else {
                            value = local.values[i][id];
                        }
                        let object = {
                            hidden: !row.getVisible(),
                            id: id,
                            val: Crm.Tool.formatBody(row, value),
                            title: row.getName(),
                            name: row.getFieldName()
                        };
                        if (row.getType() == 'ftCalc') {
                            object['calc'] = this.getCalcValue(row, local.values[i].fields);
                        }
                        data.td.push(object);
                    }
                }
                body.push(data);
            }
            return body;
        },
        getCalcValue: function (parent_row, data) {
            let self = this;
            try {
                let formula_array = parent_row.getCalcFormula(true);
                let after_points = parent_row.getCalcNumberAfterPoint();
                for (let i = 0; i < formula_array.length; i++) {
                    let val = formula_array[i];
                    let row_id = self.getRowByFieldName(val);
                    if (row_id) {
                        let row = self.getRow(row_id);
                        if (row.getType() == 'ftCalc') {
                            if (self.checkCircle(parent_row, row)) {
                                return 'Кольцевая ссылка';
                            } else {
                                formula_array[i] = self.getCalcValue(row, data);
                            }
                        } else {
                            formula_array[i] = data[row_id] || '0';
                        }
                    }
                }
                let result_string = formula_array.join('').replace(/,/gi, '.');
                return parseFloat(eval(result_string).toFixed(after_points));
            } catch (e) {
                console.log('calc error', e);
                return 'ошибка вычисления';
            }
        },
        checkCircle: function (first_row, second_row) {
            let array = second_row.getCalcFormula(true);
            let name = first_row.getFieldName();
            return array.indexOf(name) != '-1';
        },
        getData: function (section, callback) {
            let self = this;
            local.data.pagination.send.limit = Crm.limitFieldsByPage();
            let total = Math.ceil(local.data.pagination.send.total / parseInt(local.data.pagination.send.limit));
            if (total == 0) {
                total = 1;
            }
            switch (section) {
                case 'first':
                    section = 1;
                    break;
                case 'last':
                    section = total;
                    break;
                case 'left':
                    section = local.data.pagination.send.page - 1;
                    break;
                case 'right':
                    section = local.data.pagination.send.page + 1;
                    break;
                default:
                    if (typeof section == 'undefined') {
                        section = local.data.pagination.send.page;
                    }
                    section = parseInt(section);
                    break;
            }
            if (section > total) {
                section = total;
            } else if (section < 1) {
                section = 1;
            }
            local.data.pagination.send.page = section;
            let params = {
                id: local.data.id,
                page: local.data.pagination.send.page,
                limit: local.data.pagination.send.limit,
                start: (local.data.pagination.send.page - 1) * local.data.pagination.send.limit,
                field: local.data.pagination.send.field,
                order: local.data.pagination.send.order
            };
            if (Object.keys(local.data.find).length > 0) {
                params.searchdata = local.last_search_string;
            } else {
                params.searchdata = '';
            }
            Request.getCrmData(params, function (data) {
                self.parseData(data.xml());
                callback(self.getTbody());
            })
        },
        setSearchData: function (row_id, value, callback) {
            if (value == '' || value == '#empty') {
                if (typeof local.data.find[row_id] != 'undefined') {
                    delete local.data.find[row_id];
                }
            } else {
                local.data.find[row_id] = value;
            }
            let reason = false;
            let search_string = JSON.stringify(local.data.find).encode();
            if (search_string != local.last_search_string) {
                local.last_search_string = search_string;
                reason = true;
            }
            callback(search_string, reason);
        },
        clearSearch: function () {
            local.data.find = {};
        },
        filter: function (data, callback) {
            if (typeof data['id'] != 'undefined') {
                local.data.pagination.send.field = data['id'];
            }
            if (typeof data['order'] != 'undefined') {
                local.data.pagination.send.order = data['order'];
            }
            if (typeof callback == 'function') {
                callback();
            }
        },
        getOrder: function () {
            return {
                order: local.data.pagination.send.order,
                id: local.data.pagination.send.field,
                index: local.data.structure.visual.indexOf(local.data.pagination.send.field)
            };
        },
        parseData: function (xml) {
            local.values = [];
            local.data.pagination.send.total = parseInt($('crmstruct', xml).attr('totalcount'));
            $('crmobject', xml).each(function (index, item) {
                let obj = $(item), cr = '', mr = '';
                let fields = Tool.xmlToJson($('fields', obj)[0]);
                for (let id in fields) {
                    if (fields.hasOwnProperty(id)) {
                        if (typeof fields[id] == 'object') {
                            fields[id] = Tool.decode($(fields[id]).text());
                        }
                    }
                }
                if ($('created', obj).text()) {
                    cr = moment(Tool.decode($('created', obj).text()), 'YYYY-MM-DD HH:mm:ss').toDate();
                }
                if ($('modified', obj).text()) {
                    mr = moment(Tool.decode($('modified', obj).text()), 'YYYY-MM-DD HH:mm:ss').toDate();
                }
                let crmobj = {
                    id: $('id', obj).text(),
                    created: cr,
                    modified: mr,
                    modified_id: Dataset.get('user',$('modified_id', obj).text()).getName(),
                    fields: fields
                };
                local.values.push(crmobj);
            });
        },
        getNavigation: function () {
            let total = Math.ceil(local.data.pagination.send.total / parseInt(local.data.pagination.send.limit));
            let start = parseInt(local.data.pagination.send.page);
            let left = start - 2 > 1 ? start - 2 : 1;
            let right = start + 2 < total ? start + 2 : total;
            let diff = {
                left: start - left,
                right: right - start,
            };
            right = 2 - diff.left + right;
            left = left - (2 - diff.right);
            if (right > total) {
                right = total;
            }
            if (left > start) {
                left = start;
            }
            if (left < 1) {
                left = 1;
            }
            let list = [];
            for (let i = left; i <= right; i++) {
                list.push({
                    value: i,
                    selected: start == i
                });
            }
            let limits = [];
            for (let j = 0; j < local.data.pagination.limit_array.length; j++) {
                limits.push({
                    value: local.data.pagination.limit_array[j],
                    selected: local.data.pagination.limit_array[j] == local.data.pagination.send.limit
                })
            }
            let show_lf = false;
            if (total > 5) {
                show_lf = true;
            }
            let lang = Lang.get().crm.pagination;
            return {
                list: list,
                limits: limits,
                show_lf: show_lf,
                left: start > 1,
                right: start < total,
                first: start != 1,
                last: start != total,
                // titles
                first_title: lang['first'],
                previous_title: lang['previous'],
                next_title: lang['next'],
                last_title: lang['last'],
                limit_title: lang['limit']
            };
        },
        removeRecords: function (records, callback) {
            let lang = Lang.get().crm.remove;
            let text = '';
            let success = '';
            let length = records.length;
            switch (true) {
                case length == 0:
                    return false;
                    break;
                case length == 1:
                    text = lang['record'];
                    success = lang['success_one'];
                    break;
                case length > 1:
                    text = lang['records'];
                    success = lang['success'];
                    break;
            }
            Notice.confirm(text, lang['remove'], lang['cancel'], function () {
                Request.removeCrmRecords({
                    body: {id: records.join(',')},
                    task_id: local.data.id,
                    object_id: local.data.object_id
                }, function () {
                    Notice.notify(success);
                    callback();
                });
            });
        },
        getAccess: function (id) {
            try {
                return local.data.access[id];
            } catch (e) {
                return local.data.access;
            }
        },
        checkAccess: function (type) {
            if (this.getOrganization().isEditable()) {
                return true;
            } else {
                if (local.data.access.admin == true) {
                    return true;
                } else {
                    let my_id = Authorization.getCurrentUser().getId();
                    if (typeof local.data.access.users[my_id] != 'undefined') {
                        return local.data.access.users[my_id].indexOf(type) != '-1';
                    }
                    return false;
                }
            }
        },
        getDataToForm: function (record_id, index) {
            let lang = Lang.get()['crm']['edit'];
            let config = {
                'record': {
                    options: {
                        id: 'record',
                        multi: false,
                        title: (typeof record_id == 'undefined' ? lang['new'] : 'Запись № ' + record_id),
                        type: 'section'
                    },
                    value: {}
                }
            };
            for (let i = 0; i < local.data.structure.positions.length; i++) {
                let row_id = local.data.structure.positions[i];
                let row = local.data.structure.rows[row_id];
                let id = row.getId();
                let append = true;
                let multi = row.getIsMultiple();
                let type = row.getType();
                let options = false;
                if (row.isSystem() == false) {
                    switch (type) {
                        case 'ftString':
                        case 'ftText':
                        case 'ftInt':
                        case 'ftFloat':
                            type = 'string';
                            break;
                        case 'ftDateTime':
                            type = 'date';
                            break;
                        case 'ftCheckbox':
                            type = 'checkbox';
                            break;
                        case 'ftCombobox':
                            type = 'select';
                            options = Crm.Tool.convertToArray(row);
                            break;
                        case 'ftFile':
                            type = 'file';
                            break;
                        case 'ftImage':
                            type = 'image';
                            break;
                        case 'ftLookup':
                        case 'ftCalc':
                            append = false;
                            break;
                        default:
                            break;
                    }
                    if (append) {
                        config.record.value[id] = {
                            options: {
                                id: id,
                                type: type,
                                title: row.getName(),
                                multi: multi,
                                split: '\t',
                                hidden: false,
                                placeholder: ""
                            },
                            value: function () {
                                let data = '';
                                if (typeof index != 'undefined' && typeof local.values[index] != 'undefined') {
                                    data = local.values[index].fields[id] || '';
                                }
                                if (multi) {
                                    data = data.split('\t');
                                }
                                return data;
                            }()
                        };
                        if (options != false) {
                            config.record.value[id]['options']['options'] = options;
                        }
                    }
                }
            }
            return config;
        },
        sendRecordData: function (type, data, callback) {
            Request.saveCrmRecords({
                body: function (fields) {
                    if (type == 'create') {
                        fields.created = moment().format('YYYY-MM-DD HH:mm:ss');
                    }
                    fields.modified = moment().format('YYYY-MM-DD HH:mm:ss');
                    fields.modified_id = Authorization.getCurrentUser().getId();
                    return fields;
                }(data),
                task_id: local.data.id,
                object_id: local.data.object_id,
                operation_type: type
            }, function () {
                Notice.notify('');
                callback();
            });
        },
        getEditStructure: function () {
            return new Crm.EditStructure(local.data);
        }
    };
};