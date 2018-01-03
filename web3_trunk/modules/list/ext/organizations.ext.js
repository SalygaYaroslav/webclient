/**
 * список организаций
 * @param type
 * @param user_id
 * @returns {{list: list, sort: sort, removePrivate: removePrivate, convertToSelect: convertToSelect}}
 * @constructor
 */
List.Organizations = function (type, user_id) {
    /** private */
    let local = {
        list: [],
        order: null
    };
    /** constructor */
    switch (type) {
        case 'all':
            let ids = Dataset.Tree.getOrganizationIds();
            for (let i = 0; i < ids.length; i++) {
                local.list.push(Dataset.get('organization',ids[i]));
            }
            break;
        case 'user':
            if (typeof user_id != 'undefined') {
                local.list = Dataset.get('user',user_id).getUserOrganization();
            } else {
                local.list = Authorization.getCurrentUser().getUserOrganization();
            }
            break;
        default:
            break;
    }
    /** public */
    return {
        /**
         * список организаций
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
         * удалить приватную орг. из списка
         */
        removePrivate: function () {
            for (let i = 0; i < local.list.length; i++) {
                if (local.list[i].getId() == 'other') {
                    local.list.cleanByIndex(i);
                }
            }
        },
        /**
         * конвертируем в селект
         * @param default_value
         * @returns {*|jQuery}
         */
        convertToSelect: function (default_value) {
            let div = $('<div>').addClass('lst-select --organization');
            let select = $('<select>').appendTo(div);
            for (let i = 0; i < local.list.length; i++) {
                let org = local.list[i];
                $('<option>').val(org.getId()).html(org.getName()).attr('title', org.getName()).appendTo(select);
            }
            if (typeof default_value != 'undefined') {
                select.val(default_value);
            }
            return div;
        }
    };
};