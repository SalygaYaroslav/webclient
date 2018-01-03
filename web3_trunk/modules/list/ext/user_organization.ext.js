/**
 * список пользователей организации
 * @param org_id
 * @returns {{list: list, sort: sort, sortByName: sortByName, convertToSelect: convertToSelect}}
 * @constructor
 */
List.UserOrganization = function (org_id) {
    /** private */
    let local = {
        org: null,
        list: [],
        order: null
    };
    /** constructor */
    local.org = Dataset.get('organization',org_id);
    local.list = local.org.getUsers();

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
         * @param default_value
         * @returns {*|jQuery}
         */
        convertToSelect: function (default_value) {
            let div = $('<div>').addClass('lst-select --user');
            let select = $('<select>').appendTo(div);
            for (let i = 0; i < local.list.length; i++) {
                let user = local.list[i];
                $('<option>').val(user.getId()).html(user.getName()).attr('title', user.getName()).appendTo(select);
            }
            if (typeof default_value != 'undefined') {
                select.val(default_value);
            }
            select.selectize();
            return div;
        }
    };
};