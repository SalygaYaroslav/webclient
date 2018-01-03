/**
 * список црм
 * @param org_id
 * @param default_only
 * @returns {{list: list, load: load, sort: sort, sortByName: sortByName, convertToSelect: convertToSelect}}
 * @constructor
 */
List.Crm = function (org_id, default_only) {
    /** private */
    let local = {
        parent_org: null,
        default_only: false,
        list: [],
        order: null
    };
    /** constructor */
    local.default_only = default_only;
    local.parent_org = Dataset.get('organization',org_id);

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
         * подгрузка задач
         * @param callback
         */
        load: function (callback) {
            let self = this;
            if (local.sync) {
                local.list = Crm.getCrmListByOrgId(local.parent_org.getId(), local.default_only);
            } else {
                Crm.getCrmListByOrgId(local.parent_org.getId(), local.default_only, function (crms) {
                    local.list = crms;
                    callback(self);
                });
            }
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
                let first_value = first['vcName'].toLowerCase();
                let second_value = second['vcName'].toLowerCase();
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
            let div = $('<div>').addClass('lst-select --task');
            let select = $('<select>').appendTo(div);
            for (let i = 0; i < local.list.length; i++) {
                let task = local.list[i];
                $('<option>').val(task.getId()).html(task.getName()).attr('title', task.getName()).appendTo(select);
            }
            if (typeof default_value != 'undefined') {
                select.val(default_value);
            }
            return div;
        }
    };
};