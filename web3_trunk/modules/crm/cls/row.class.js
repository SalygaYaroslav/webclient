Crm.Row = function (parent_, xml) {
    let parent = parent_;
    let local = Tool.xmlAttrToJson(xml);
    let storage = {};
    return {
        set: function () {
            let self = this;
            self.convertType();
            self.convertFulllist();
            self.convertFunnel();
            self.convertUnique();
            self.convertColoring();
            self.convertVisible();
            self.convertDefaulttext();
            self.convertLookup();
            return this;
        },
        getParent: function () {
            return parent;
        },
        getId: function () {
            return local['dbname'];
        },
        getName: function () {
            let name = local['displayname'];
            if (this.getIsLookUp()) {
                name += '\'';
            }
            return name;
        },
        getFieldName: function () {
            return local['field_name'] || '';
        },
        getPosition: function () {
            return local['position'];
        },
        getType: function (original) {
            if (typeof original == 'undefined') {
                return local['convert_type'].t;
            } else {
                return local['type'];
            }
        },
        getIsLookUp: function () {
            return Object.values(this.getLookup())[0];
        },
        getIsMultiple: function () {
            return local['convert_type'].m;
        },
        getEmpty: function () {
            return (local['empty'] + '').toBoolean();
        },
        getLookupEmpty: function () {
            let empty = true;
            let funnel = this.getFunnel();
            if (typeof funnel != 'undefined' && funnel.val.empty_item == false) {
                empty = false;
            }
            return empty;
        },
        getLookupFields: function (original) {
            if (typeof original == 'undefined') {
                return local['convert_lookup'];
            } else {
                return local['lookup_fields'];
            }
        },
        getFulllist: function (original) {
            if (typeof original == 'undefined') {
                return local['convert_fulllist'];
            } else {
                return local['fulllist'];
            }
        },
        getVisible: function (original) {
            if (typeof original == 'undefined') {
                return local['convert_visible'];
            } else {
                return local['invisible'];
            }
        },
        getFunnel: function (original) {
            if (typeof original == 'undefined') {
                return local['convert_funnel'];
            } else {
                return local['funnel'];
            }
        },
        getColoring: function (original) {
            if (typeof original == 'undefined') {
                return local['convert_coloring'];
            } else {
                return local['convert_coloring'];
            }
        },
        getIsSorted: function () {
            if (this.getType() == 'ftCalc') {
                return false;
            }
            return (local['search'] + '').toBoolean();
        },
        getCalcFormula: function (as_array) {
            if (as_array) {
                let formula = this.getFunnel().val.expression.replace(/([\/\*\-\+\(\)])/gi, function (val) {
                    return '::' + val + '::';
                });
                return formula.split(/::/gi);
            } else {
                return this.getFunnel().val.expression;
            }
        },
        getCalcNumberAfterPoint: function () {
            return this.getFunnel().val.precision || 2;
        },
        /**
         *
         * @param value
         * @returns {*}
         */
        convertParentLookup: function (value) {
            if (typeof value == 'undefined') {
                return local['convertParentLookup'];
            } else {
                local['convertParentLookup'] = value;
            }
        },
        /**
         *
         */
        convertType: function () {
            local['convert_type'] = {};
            let type = local.type;
            let multi = false;
            if (local['element_type'] != "" && typeof local['element_type'] != "undefined") {
                type = local['element_type'];
                multi = true;
            }
            if (type == 'ftLargeint') {
                type = 'ftInt';
            }
            if (type == 'ftDate') {
                type = 'ftDateTime';
            }
            local['convert_type'] = {
                t: type,
                m: multi
            };
        },
        /**
         *
         * @returns {{}}
         */
        getLookup: function () {
            return {[local['dbname']]: /^t(\d*)\./gi.test(local['dbname'])};
        },
        /**
         *
         * @returns {boolean}
         */
        convertFulllist: function () {
            if (local['fulllist'] == '' || typeof local['fulllist'] == 'undefined') {
                local['convert_fulllist'] = {
                    t: '',
                    d: '',
                    v: []
                };
                return false;
            }
            local['convert_fulllist'] = {};
            let t = local['fulllist'].match(/\=(.*)\:/);
            let d = local['fulllist'].match(/default\=(\d*)\;/);
            let v = local['fulllist'].replace(/(\=(.*)\:)?(default=(\d*);)?/, "");
            local['convert_fulllist'] = {
                t: ((t) ? t[1] : ''),
                d: ((d) ? d[1] : ''),
                v: ((v != '') ? v.split(';') : [])
            };
            for (let i = 0; i < local['convert_fulllist'].v.length; i++) {
                if (local['convert_fulllist'].v[i] == "0") {
                    local['convert_fulllist'].v[i] = "-10";
                }
            }
        },
        convertFunnel: function () {
            if (typeof local['funnel'] == 'undefined') {
                local['funnel'] = '';
            }
            // костыль для старых таблиц с типом ftDateTime
            if (local['convert_type'].t == 'ftDateTime' && local['funnel'] == '') {
                switch (local['type']) {
                    case 'ftDate':
                        local['funnel'] = '<date format="date"/>';
                        break;
                    case 'ftString':
                        switch (local['element_type']) {
                            case 'ftDate':
                                local['funnel'] = '<date format="date"/>';
                                break;
                            case 'ftString':
                                break;
                            default :
                                local['funnel'] = '<date format="datetime"/>';
                                break;
                        }
                        break;
                    default :
                        local['funnel'] = '<date format="datetime"/>';
                        break;
                }
            }
            if (local['funnel'] == '' || typeof local['funnel'] == 'undefined') {
                local['funnel'] = '';
                if (typeof local['convert_funnel'] != 'undefined') {
                    delete local['convert_funnel'];
                }
                return false;
            }
            local['convert_funnel'] = {};
            switch (local['convert_type'].t) {
                case 'ftDateTime':
                    local['convert_funnel'] = {
                        t: local['convert_type'].t,
                        val: $('date', Tool.stringToXml(local['funnel'])).attr('format')
                    };
                    break;
                case 'ftText':
                case 'ftString':
                    let val = '', type = '', parent = '', regexpr = '', eregexpr = '';
                    let xml = Tool.stringToXml(local['funnel']);
                    if ($('text', xml).length > 0) {
                        parent = 'text';
                        let attr = Tool.xmlAttrToJson($('text', xml)[0]);
                        switch (true) {
                            case (typeof attr['allowed'] != 'undefined'):
                                type = 'allowed';
                                break;
                            case (typeof attr['phone'] != 'undefined'):
                                type = 'phone';
                                break;
                            case (typeof attr['is-mail'] != 'undefined'):
                                type = 'is-mail';
                                break;
                            case (typeof attr['location'] != 'undefined'):
                                type = 'location';
                                break;
                            case (typeof attr['search'] != 'undefined'):
                                type = 'search';
                                break;
                            case (typeof attr['auto-date'] != 'undefined'):
                                type = 'auto-date';
                                break;
                            case (typeof attr['call-phone'] != 'undefined'):
                                type = 'call-phone';
                                break;
                            default:
                                break;
                        }
                        if (type != '') {
                            val = attr[type];
                        }
                        if ($('text', xml).find('regexpr').length > 0) {
                            regexpr = $('text', xml).find('regexpr').text();
                        }
                        if ($('text', xml).find('regexpr-error').length > 0) {
                            eregexpr = $('text', xml).find('regexpr-error').text();
                        }
                    }
                    local['convert_funnel'] = {
                        t: local['convert_type'].t,
                        p: parent,
                        f: type,
                        r: regexpr,
                        e: eregexpr,
                        val: val
                    };
                    break;
                case 'ftInt':
                    local['convert_funnel'] = {
                        t: local['convert_type'].t,
                        val: $('number', Tool.stringToXml(local['funnel'])).attr('format')
                    };
                    break;
                case 'ftFloat':
                    local['convert_funnel'] = {
                        t: local['convert_type'].t,
                        val: {
                            format: $('number', Tool.stringToXml(local['funnel'])).attr('format') || '',
                            precision: $('number', Tool.stringToXml(local['funnel'])).attr('precision') || ''
                        }
                    };
                    break;
                case 'ftCalc':
                    let cxml_calc = $('expression', Tool.stringToXml(local['funnel']));
                    local['convert_funnel'] = {
                        t: local['convert_type'].t,
                        val: {
                            expression: cxml_calc.text().replace(/\s/gi, "+") || '',
                            precision: cxml_calc.attr('precision') || ''
                        }
                    };
                    break;
                case 'ftCombobox':
                    let cxml = $('settings', Tool.stringToXml(local['funnel']));
                    local['convert_funnel'] = {
                        t: local['convert_type'].t,
                        val: {
                            enabled: $('enabled', cxml).text().toBoolean(),
                            name: $('name', cxml).text(),
                            assign: $('assign', cxml).text(),
                            t: $('assign', cxml).attr('type') || '',
                            empty_item: $('empty_item', cxml).text() != 'disabled'
                        }
                    };
                    if ($('FUNNEL', cxml).length > 0) {
                        let voron = $('FUNNEL', cxml);
                        local['convert_trade'] = {};
                        $('section', voron).each(function (i, item) {
                            let items = [];
                            $('item', item).each(function () {
                                items.push($(this).text());
                            });
                            local['convert_trade'][$('caption', item).text()] = {
                                items: items,
                                color: $('color', item).text()
                            };
                        });
                    }
                    break;
                case 'ftLookup':
                    local['convert_funnel'] = {
                        t: local['convert_type'].t,
                        val: $('lookup', Tool.stringToXml(local['funnel'])).attr('external-dialog')
                    };
                    break;
                default:
                    console.error(local);
                    //alert("ЧТО ТО НОВОЕ?!?!?!\n" + col.funnel);
                    break;
            }
        },
        convertColoring: function () {
            if (typeof local['coloring'] == 'undefined' || local['coloring'] == '') {
                if (typeof local['convert_coloring'] != 'undefined') {
                    delete local['convert_coloring'];
                }
                local['coloring'] = '';
                return false;
            }
            local['convert_coloring'] = {};
            let array = local['coloring'].split('\r\n');
            for (let i = 0; i < array.length; i++) {
                if (array[i] != '') {
                    let match = array[i].match(/(.*);(.*)/);
                    local['convert_coloring']['v_' + match[1]] = match[2];
                }
            }
        },
        convertVisible: function () {
            let id = parent.getId();
            let chk = typeof storage[id] != 'undefined';
            if (typeof local['invisible'] == 'undefined' || local['invisible'] == '') {
                if (this.isSystem()) {
                    local['convert_visible'] = false;
                    local['invisible'] = 'true';
                    if (chk && typeof storage[id][local['dbname']] != 'undefined') {
                        local['convert_local_visible'] = storage[id][local['dbname']];
                    } else {
                        local['convert_local_visible'] = false;
                    }
                } else {
                    local['convert_visible'] = true;
                    local['invisible'] = 'false';
                    if (chk && typeof storage[id][local['dbname']] != 'undefined') {
                        local['convert_local_visible'] = storage[id][local['dbname']];
                    } else {
                        local['convert_local_visible'] = true;
                    }
                }
            } else {
                local['convert_visible'] = !(local['invisible'].toBoolean());
                if (chk && typeof storage[id][local['dbname']] != 'undefined') {
                    local['convert_local_visible'] = storage[id][local['dbname']];
                } else {
                    local['convert_local_visible'] = local['convert_visible'];
                }
            }
            return true;
        },
        convertUnique: function () {
            if (typeof local['unique'] == 'undefined' || local['unique'] == '') {
                if (typeof local['convert_unique'] != 'undefined') {
                    delete local['convert_unique'];
                }
                local['convert_unique'] = {
                    a: false,
                    r: '1'
                };
                return false;
            }
            let cxml = $('unique', Tool.stringToXml(local['unique']));
            local['convert_unique'] = {
                a: $('apply', cxml).text().toBoolean(),
                r: $('repeats', cxml).text()
            };
        },
        convertDefaulttext: function () {
            if (local['defaulttext'] == '') {
                local['convert_defaulttext'] = '';
            } else {
                switch (local['convert_type'].t) {
                    case 'ftDateTime':
                        let mom = null;
                        switch (true) {
                            case new RegExp(/^today/i).test(local['defaulttext']):
                                mom = moment();
                                if (/-/gi.test(local['defaulttext'])) {
                                    mom.add(-local['defaulttext'].replace(/[^\d]/gi, ''), 'd');
                                } else {
                                    mom.add(local['defaulttext'].replace(/[^\d]/gi, ''), 'd');
                                }
                                break;
                            case new RegExp(/^tomorrow/i).test(local['defaulttext']):
                                mom = moment().add(1, "d");
                                if (/-/gi.test(local['defaulttext'])) {
                                    mom.add(-local['defaulttext'].replace(/[^\d]/gi, ""), 'd');
                                } else {
                                    mom.add(local['defaulttext'].replace(/[^\d]/gi, ""), 'd');
                                }
                                break;
                            case new RegExp(/^yesterday/i).test(local['defaulttext']):
                                mom = moment().add(-1, 'd');
                                if (/-/gi.test(local['defaulttext'])) {
                                    mom.add(-local['defaulttext'].replace(/[^\d]/gi, ''), 'd');
                                } else {
                                    mom.add(local['defaulttext'].replace(/[^\d]/gi, ''), 'd');
                                }
                                break;
                            case new RegExp(/^calendar/i).test(local['defaulttext']):
                                mom = moment();
                                if (/-/gi.test(local['defaulttext'])) {
                                    mom.add(-local['defaulttext'].replace(/[^\d]/gi, ''), 'd');
                                } else {
                                    mom.add(local['defaulttext'].replace(/[^\d]/gi, ''), 'd');
                                }
                                break;
                            default:
                                mom = moment(local['defaulttext'], ['DD.MM.YYYY HH:mm', 'DD.MM.YYYY', 'HH:mm', 'YYYY-MM-DD HH:mm.ss']);
                                break;
                        }
                        switch (local['convert_funnel'].val) {
                            case 'date':
                                local['convert_defaulttext'] = local['defaulttext'];
                                local['convert_defaulttext_date'] = mom.format('DD.MM.YYYY');
                                break;
                            case 'datetime':
                            case 'datetime_separated':
                                local['convert_defaulttext'] = local['defaulttext'];
                                local['convert_defaulttext_date'] = mom.format('DD.MM.YYYY HH:mm');
                                break;
                            case "time":
                                local['convert_defaulttext'] = local['defaulttext'];
                                local['convert_defaulttext_date'] = mom.format('HH:mm');
                                break;
                        }
                        break;
                    default:
                        local['convert_defaulttext'] = local['defaulttext'];
                        break;
                }
            }
        },
        convertLookup: function () {
            if (typeof local['lookup_fields'] == 'undefined' || local['lookup_fields '] == '') {
                if (typeof local['convert_lookup'] != 'undefined') {
                    delete local['convert_lookup'];
                }
                local['lookup_fields'] = '';
                return false;
            }
            let split = local['lookup_fields'].split('\r\n');
            if (split != null) {
                let table_id = '';
                let in_ids = [];
                let out_ids = [];
                if (split[0]) {
                    table_id = split[0].split(':')[0];
                    if (split[0].split(':')[1]) {
                        in_ids = split[0].split(':')[1].split(';');
                    }
                }
                if (split[1]) {
                    out_ids = split[1].split(';');
                }
                local['convert_lookup'] = {
                    tid: table_id,
                    inids: in_ids,
                    outids: out_ids
                };
            } else {
                local['convert_lookup'] = {
                    tid: '0',
                    inids: [],
                    outids: []
                };
            }
            for (let i = 0; i < local['convert_lookup'].inids.length; i++) {
                if (local['convert_lookup'].inids[i] == 'server_id') {
                    local['convert_lookup'].inids[i] = 'id';
                }
            }
            for (let i = 0; i < local['convert_lookup'].outids.length; i++) {
                if (local['convert_lookup'].outids[i] == 'server_id') {
                    local['convert_lookup'].outids[i] = 'id';
                }
            }
        },
        isSystem: function () {
            return ['modified', 'modified_id', 'created'].indexOf(this.getId()) != '-1';
        },
        getTypeToEdit: function () {
            let type = this.getType();
            if (type == 'ftDateTime') {
                type = this.getFunnel().val;
            }
            return {text: Crm.Tool.getListType(type), id: type}
        },
        getContentToEditForm: function () {
            let self = this;
            let div = $('<div></div>');
            let main_config = TreeForm.loadConfig('crm/main');
            let main_data = {};
            let parse_array = function (data, array) {
                console.log(self.getId(), local);
                for (let i = 0; i < array.length; i++) {
                    let arrg = array[i];
                    let id = arrg.options.id;
                    let type = arrg.options.type;
                    switch (type) {
                        case 'section':
                            data[id] = {
                                options: arrg.options,
                                value: {}
                            };
                            parse_array(data[id].value, arrg.children);
                            break;
                        default:
                            data[id] = {
                                options: arrg.options,
                                value: function () {
                                    let result = '';
                                    switch (id) {
                                        case 'empty':
                                            result = !(self.getEmpty()) + '';
                                            break;
                                        case 'multiple':
                                            result = self.getIsMultiple() + '';
                                            break;
                                        case 'format':
                                            switch (self.getType()) {
                                                case 'ftString':
                                                case 'ftText':
                                                    let funnel = self.getFunnel();
                                                    if (typeof funnel != 'undefined' && typeof funnel['f'] != 'undefined') {
                                                        if (funnel['f'] == 'allowed') {
                                                            result = 'allowed_' + funnel['val'];
                                                        } else {
                                                            result = funnel['f'] || '0';
                                                        }
                                                    } else {
                                                        result = '0';
                                                    }
                                                    break;
                                                default:
                                                    result = '0';
                                                    break;
                                            }
                                            break;
                                        default:
                                            result = (local[id] || '');
                                            break;
                                    }
                                    return result;
                                }()
                            };
                            break;
                    }
                }
            };
            parse_array(main_data, main_config);
            console.log(main_data);
            let main_form = new TreeForm.Form(main_data, true);
            div.append(main_form.render());

            let params = $('<div></div>').appendTo(div);
            let select_type = div.find('#type').find('select').eq(0);
            select_type.on('change', function () {
                params.empty();
                let type = $(this).val();
                switch (type) {
                    case 'ftFile':
                    case 'ftImage':
                        break;
                    default:
                        let params_data = {};
                        let params_config = TreeForm.loadConfig('crm/params/' + type);
                        parse_array(params_data, params_config);
                        console.log(params_data);
                        let params_form = new TreeForm.Form(params_data, true);
                        params.append(params_form.render());
                        break;
                }
            });
            select_type.trigger('change');
            return div;
        },
        getTfoot: function () {
            let self = this;
            let html = '';
            switch (this.getType()) {
                case 'ftCalc':
                    break;
                case 'ftCombobox':
                    let array = Crm.Tool.convertToArray(self);
                    html = '<select>';
                    html += '<option value="#empty"></option>';
                    for (let i = 0; i < array.length; i++) {
                        html += '<option value="' + array[i].value + '">' + array[i].text + '</option>';
                    }
                    html += '</select>';
                    break;
                case 'ftCheckbox':
                    html = '<select><option value="#empty"></option><option value="false">Нет</option><option value="true">Да</option></select>';
                    break;
                default:
                    html = '';
                    break;
            }
            console.log(html);
            return html;
        },
        getTfootData: function () {
            let self = this;
            let object = {};
            switch (this.getType()) {
                case 'ftCalc':
                    object.type = 'none';
                    break;
                case 'ftCombobox':
                    object.type = 'select';
                    object.list = Crm.Tool.convertToArray(self);
                    object.empty = self.getLookupEmpty();
                    break;
                case 'ftCheckbox':
                    object.type = 'select';
                    object.list = [{text: 'Нет', value: 'false'}, {text: 'Да', value: 'true'}];
                    object.empty = false;
                    break;
                default:
                    object.type = 'input';
                    break;
            }
            return object;
        }
    };
};