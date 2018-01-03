/**
 * ������ �����
 * @param project_id
 * @param sync
 * @returns {{list: list, load: load, sort: sort, sortByName: sortByName, convertToSelect: convertToSelect}}
 * @constructor
 */
List.Tasks = function (project_id, sync) {
    /** private */
    let local = {
        parent_org: null,
        parent_project: null,
        sync: null,
        list: [],
        order: null
    };
    /** constructor */
    local.parent_project = Dataset.get('project',project_id);
    local.sync = sync;
    local.parent_org = local.parent_project.getParentOrganization();

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
         * ��������� �����
         * @param callback
         */
        load: function (callback) {
            let self = this;
            if (local.sync) {
                local.list = local.parent_project.getTasksSync();
            } else {
                local.parent_project.getTasks(function (tasks) {
                    local.list = tasks;
                    callback(self);
                });
            }
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