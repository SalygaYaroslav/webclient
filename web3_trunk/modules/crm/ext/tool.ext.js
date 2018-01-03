/**
 *
 * @type {{formatBody, formatList, convertToArray}}
 */
Crm.Tool = function () {
    let local = {};
    return {
        formatBody: function (row, value, as_array) {
            let result = '';
            let type = row.getType();
            if (typeof value != 'undefined' && value != '') {
                let funnel = row.getFunnel();
                let coloring = row.getColoring();
                let data = [];
                if (typeof value == 'object') {
                    data = [moment(value).format('YYYY-MM-DD HH:mm:ss')];
                } else {
                    data = $.trim(value).split('\t');
                }
                let array = [];
                switch (type) {
                    case 'ftText':
                        for (let i = 0; i < data.length; i++) {
                            if (typeof funnel != 'undefined' && funnel.val == 'phone') {
                                array.push(data[i].toString());
                            } else if (funnel && funnel.val == 'requisites') {
                                // array.push(self.requisit_table(data[i]));
                            } else {
                                array.push(data[i].toString().parseHTMLLinks());
                            }
                        }
                        break;
                    case 'ftString':
                        for (let i = 0; i < data.length; i++) {
                            if (typeof funnel != 'undefined' && funnel.val == 'phone') {
                                if (Tool.phone.checkPhone(data[i], true)) {
                                    array.push(Tool.phone.convert(data[i], true).parseHTMLLinks());
                                }
                            } else {
                                array.push(data[i].toString().parseHTMLLinks());
                            }
                        }
                        break;
                    case 'ftDateTime':
                        if (typeof funnel != "undefined") {
                            switch (funnel.val) {
                                case 'date':
                                    for (let i = 0; i < data.length; i++) {
                                        if (data[i] != '' && data[i] != '0000-00-00 00:00:00') {
                                            array.push(moment(data[i], 'YYYY-MM-DD HH:mm:ss').format('DD.MM.YYYY'));
                                        }
                                    }
                                    break;
                                case 'time':
                                    for (let i = 0; i < data.length; i++) {
                                        if (data[i] != '' && data[i] != '0000-00-00 00:00:00') {
                                            array.push(moment(data[i], ['0000-00-00 HH:mm:ss', 'YYY-MM-DD HH:mm:ss']).format('HH:mm'));
                                        }
                                    }
                                    break;
                                case 'datetime':
                                    for (let i = 0; i < data.length; i++) {
                                        if (data[i] != '' && data[i] != '0000-00-00 00:00:00') {
                                            array.push(moment(data[i], 'YYYY-MM-DD HH:mm:ss').format('DD.MM.YYYY HH:mm'));
                                        }
                                    }
                                    break;
                                case 'datetime_separated':
                                    for (let i = 0; i < data.length; i++) {
                                        if (data[i] != '' && data[i] != '0000-00-00 00:00:00') {
                                            array.push(moment(data[i], 'YYYY-MM-DD HH:mm:ss').format('DD.MM.YYYY HH:mm'));
                                        }
                                    }
                                    break;
                            }
                        }
                        break;
                    case 'ftCheckbox':
                        for (let i = 0; i < data.length; i++) {
                            let b = data[i].toBoolean();
                            let v = (b) ? 'Да' : 'Нет';
                            if (typeof coloring != 'undefined' && typeof coloring['v_' + data[i]] != 'undefined') {
                                let color = coloring['v_' + data[i]].replace('$00', '#');
                                let style = 'background-color:' + color;
                                array.push("<span class='full-wh' style='" + style + "'>" + v + "</span>");
                            } else {
                                array.push("<span class='full-wh'>" + v + "</span>");
                            }
                        }
                        break;
                    case 'ftFile':
                        for (let i = 0; i < data.length; i++) {
                            let split = data[i].split('\n');
                            if (split.length > 1) {
                                array.push("<a class='attach --webfile' target='_blank' href='http://file.prostoy.ru/" + split[1].replace("\r", "") + "' title='" + split[0].replace("\r", "") + "'>" + split[0].replace("\r", "") + "</a>");
                            } else {
                                array.push("<a class='attach --webfile' target='_blank' href='http://file.prostoy.ru/" + split[0].replace("\r", "") + "' title='" + split[0].replace("\r", "") + "'>" + split[0].replace("\r", "") + "</a>");
                            }
                        }
                        break;
                    case 'ftImage':
                        for (let i = 0; i < data.length; i++) {
                            let split = data[i].split('\n');
                            if (split.length > 1) {
                                array.push("<a class='attach --webfile' target='_blank' href='http://file.prostoy.ru/" + split[1].replace("\r", "") + "' title='" + split[0].replace("\r", "") + "'>" + split[0].replace("\r", "") + "</a>");
                            } else {
                                array.push("<a class='attach --webfile' target='_blank' href='http://file.prostoy.ru/" + split[0].replace("\r", "") + "' title='" + split[0].replace("\r", "") + "'>" + split[0].replace("\r", "") + "</a>");
                            }
                        }
                        break;
                    case 'ftInt':
                        for (let i = 0; i < data.length; i++) {
                            if (funnel && funnel.val == "currency") {
                                array.push(data[i].replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 '));
                            } else {
                                array.push(data[i]);
                            }
                        }
                        break;
                    case 'ftLargeint':
                        for (let i = 0; i < data.length; i++) {
                            if (funnel && funnel.val == "currency") {
                                array.push(data[i].replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 '));
                            } else {
                                array.push(data[i]);
                            }
                        }
                        break;
                    case 'ftFloat':
                        for (let i = 0; i < data.length; i++) {
                            if (funnel && funnel.val == "currency") {
                                array.push(data[i].replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 '));
                            } else {
                                array.push(data[i]);
                            }
                        }
                        break;
                    case 'ftLookup':
                        break;
                    case 'ftCombobox':
                        for (let i = 0; i < data.length; i++) {
                            let v = this.formatList(row, data[i]);
                            if (typeof coloring != "undefined") {
                                //temp
                                let style = '';
                                if (typeof coloring['v_' + data[i]] != 'undefined') {
                                    let color = coloring['v_' + data[i]].replace('$00', '#');
                                    style = 'background-color:' + color;
                                }
                                array.push("<span class='boolean_coloring' style='" + style + "'>" + v + "</span>");
                            } else {
                                array.push("<span class='boolean_coloring'>" + v + "</span>");
                            }
                        }
                        break;
                    case 'ftCalc':
                        break;
                    default:
                        result = value;
                        break;
                }
                if (typeof as_array == 'undefined') {
                    result = array.join('; ');
                }
            }
            return result;
        },
        formatList: function (row, value) {
            let fullist = row.getFulllist();
            let result = value;
            if (typeof fullist != 'undefined') {
                switch (fullist.t) {
                    case 'users':
                        switch (value) {
                            case '-3':
                                result = Authorization.getCurrentUser().getName();
                                break;
                            default:
                                try {
                                    result = Dataset.get('user',value).getName();
                                } catch (e) {

                                }
                                break;
                        }
                        break;
                    case 'groups':
                        switch (value) {
                            case '0':
                                try {
                                    result = Dataset.get('group','default_' + row.getParent().getOrganization().getId()).getName();
                                } catch (e) {

                                }
                                break;
                            default:
                                result = Dataset.get('group',value).getName();
                                break;
                        }
                        break;
                    case 'contacts':
                    case 'tasks':
                        result = Dataset.get('task',value).getName();
                        break;
                }
            }
            return result || '';
        },
        convertToArray: function (row) {
            let fullist = row.getFulllist();
            let result = [];
            if (typeof fullist != 'undefined') {
                let type = fullist.t;
                let def = fullist.d;
                let values = fullist.v;
                let empty = true;
                let funnel = row.getFunnel();
                if (typeof funnel != 'undefined' && funnel.val.empty_item == false) {
                    empty = false;
                }
                if (empty == true) {
                    result.push({value: '#empty', text: '', dont_show: true});
                }
                switch (type) {
                    case 'users':
                        if (values[0] == 'all') {
                            let list = OrganizationBlock.getCurrentOrganization().getUsers();
                            for (let i = 0; i < list.length; i++) {
                                result.push({value: list[i].getId(), text: list[i].getName()});
                            }
                        } else {
                            for (let i = 0; i < values.length; i++) {
                                let id = values[i];
                                result.push({value: id, text: Dataset.get('user',id).getName()});
                            }
                        }
                        break;
                    case 'groups':
                        for (let i = 0; i < values.length; i++) {
                            let id = values[i];
                            result.push({value: id, text: Dataset.get('group',id).getName()});
                        }
                        break;
                    case 'contacts':
                    case 'tasks':
                        for (let i = 0; i < values.length; i++) {
                            let id = values[i];
                            result.push({value: id, text: Dataset.get('task',id).getName()});
                        }
                        break;
                    default:
                        for (let i = 0; i < values.length; i++) {
                            let id = values[i];
                            result.push({value: id, text: id});
                        }
                        break;
                }
            }
            return result || [];
        },
        getListType: function (type) {
            let values = {
                "ftFloat": "Вещественное число",
                "ftCombobox": "Выпадающий список",
                "ftCalc": "Вычисляемое",
                "time": "Время",
                "date": "Дата",
                "datetime": "Дата и время",
                "datetime_separated": "Дата и время раздельно",
                "ftImage": "Изображение",
                "ftString": "Строка",
                "ftText": "Текст",
                "ftFile": "Файл",
                "ftInt": "Число",
                "ftLookup": "Связанное поле",
                "ftCheckbox": "Логическое"
            };
            return values[type] || '';
        }
    };
}();