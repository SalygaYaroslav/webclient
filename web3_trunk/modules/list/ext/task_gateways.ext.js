/**
 *
 * @param organization
 * @returns {{list: list, load: load, sort: sort, convertToSelect: convertToSelect}}
 * @constructor
 */
List.TaskGateways = function (organization, additional_class) {
    /** private */
    let local = {
        organization: null,
        list: [],
        order: null
    };
    /** constructor */
    local.organization = organization;

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
        load: function () {
            local.list = local.organization.getRouters();
            local.list.push({id: '0', email_name: '[Не выбрано]'});
            this.sort();
        },
        /**
         * сортировка
         * @param order
         */
        sort: function () {
            local.list.sort(function (first, second) {
                let first_value = first['email_name'];
                let second_value = second['email_name'];
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
            let div = $('<div>').addClass('lst-select --gateways');
            let select = $('<select>').appendTo(div);
            for (let i = 0; i < local.list.length; i++) {
                let gateway = local.list[i];
                $('<option>').val(gateway.id).html(gateway['email_name']).attr('title', gateway['email_name']).appendTo(select);
            }
            if (typeof default_value != 'undefined') {
                select.val(default_value);
            }
            select.selectize();
            select.addClass(additional_class || '');
            return div;
        }
    };
};