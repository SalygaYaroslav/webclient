/**
 * ������ ��������
 * @param org_id
 * @returns {{list: list, sort: sort, sortByName: sortByName, convertToSelect: convertToSelect}}
 * @constructor
 */
List.Projects = function (org_id) {
    /** private */
    let local = {
        parent_org: null,
        list: [],
        order: null
    };
    /** constructor */
    local.parent_org = Dataset.get('organization',org_id);
    local.list = local.parent_org.getProjects();

    /** public */
    return {
        /**
         * ������
         * @returns {Array}
         */
        list: function () {
            return local.list;
        },
        /**
         * ����������
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
         * ���������� �� �����
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
         * ������������ � ������
         * @param default_value
         * @returns {*|jQuery}
         */
        convertToSelect: function (default_value) {
            let div = $('<div>').addClass('lst-select --project');
            let select = $('<select>').appendTo(div);
            for (let i = 0; i < local.list.length; i++) {
                let project = local.list[i];
                $('<option>').val(project.getId()).html(project.getName()).attr('title', project.getName()).appendTo(select);
            }
            if (typeof default_value != 'undefined') {
                select.val(default_value);
            }
            return div;
        }
    };
};