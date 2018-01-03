/**
 * список всех пользователей
 * @param group_id
 * @returns {{list: list, sort: sort, sortByName: sortByName, convertToSelect: convertToSelect}}
 * @constructor
 */
List.Users = function (group_id) {
    /** private */
    let local = {
        parent_group: null,
        list: [],
        order: null,
        select: false
    };
    /** constructor */
    if (typeof group_id == 'undefined') {
        local.list = Dataset.Tree.getAllUsers();
    } else {
        local.parent_group = Dataset.get('group',group_id);
        local.list = local.parent_group.getUsers(true);
    }

    /** public */
    return {
        /**
         * список
         * @returns {Array}
         */
        list: function () {
            return local.list;
        },
        /**
         * сортировка
         * @param order
         */
        sort: function (order) {
            local.list.sort(function (first, second) {
                let first_value = first.getEntityField(order);
                let second_value = second.getEntityField(order);
                if (first_value < second_value) {
                    return -1;
                } else if (first_value > second_value) {
                    return 1;
                } else {
                    return 0;
                }
            })
        },
        /**
         * сортировка по имени
         */
        sortByName: function () {
            local.list.sort(function (first, second) {
                let first_value = first.getName().toLowerCase();
                let second_value = second.getName().toLowerCase();
                if (first_value < second_value) {
                    return -1;
                } else if (first_value > second_value) {
                    return 1;
                } else {
                    return 0;
                }
            })
        },
        /**
         * конвертируем в селект
         * @param with_default
         * @param default_value
         * @returns {*|jQuery}
         */
        convertToSelect: function (with_default, default_value) {
            if (local.select != false) {
                return false;
            }
            let div = $('<div>').addClass('lst-select --user');
            let select = $('<select>').appendTo(div);
            if (typeof with_default != 'undefined') {
                $('<option>').val('0').html('[Ѕез назначени€]').attr('title', '[Ќе выбрано]').appendTo(select);
            }
            for (let i = 0; i < local.list.length; i++) {
                let user = local.list[i];
                let id = user.getId();
                let name = user.getName();
                if (id != '1') {
                    $('<option>').val(id).html(name).attr('title', user.getName()).appendTo(select);
                }
            }
            let self = this;
            select.selectize({
                onDropdownClose: function () {
                    if (local.select.getValue() == '') {
                        self.setValue(0);
                    }
                }
            });
            local.select = select[0].selectize;
            if (typeof default_value != 'undefined') {
                self.setValue(default_value);
            } else {
                self.setValue(0);
            }
            return div;
        },
        setValue: function (value) {
            if (local.select != false) {
                local.select.setValue(value);
            }
        }
    };
};