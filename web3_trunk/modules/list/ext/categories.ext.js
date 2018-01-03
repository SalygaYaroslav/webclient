/**
 * список категорий
 * @param org_id
 * @returns {{list: list, sortByName: sortByName, appendDefault, convertToSelect: convertToSelect}}
 * @constructor
 */
List.Categories = function (org_id) {
    /** private */
    let local = {
        parent_org: null,
        list: [],
        order: null
    };
    /** constructor */
    local.parent_org = Dataset.get('organization',org_id);
    local.list = local.parent_org.getCategories();

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
         * добавим категорию по-умолчанию
         */
        addDefault: function () {
            local.list.push(Dataset.get('category',0));
        },
        /**
         * сортируем по имени
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
         * получим селект
         * @param with_default
         * @param default_value
         * @param onchange
         * @returns {*|jQuery}
         */
        convertToSelect: function (with_default, default_value, onchange) {
            let div = $('<div>').addClass('list-select --categories');
            this.sortByName();
            let select = $('<select>').appendTo(div);
            if (typeof with_default != 'undefined') {
                $('<option>').val('0').html('[Не выбрано]').attr('title', '[Не выбрано]').appendTo(select);
                $('<option>').val('-10').html('[Без категории]').attr('title', '[Без категории]').appendTo(select);
            }
            for (let i = 0; i < local.list.length; i++) {
                let project = local.list[i];
                $('<option>').val(project.getId()).html(project.getName()).attr('title', project.getName()).appendTo(select);
            }
            if (typeof default_value != 'undefined' && default_value != false) {
                select.val(default_value);
            }
            select.selectize({
                onChange: function (value) {
                    if (typeof onchange == 'function') {
                        onchange(value);
                    }
                }
            });
            return div;
        }
    };
};