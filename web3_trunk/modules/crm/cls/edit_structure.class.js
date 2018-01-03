Crm.EditStructure = function (base_structure) {
    let local = {
        data: {
            id: null, // id �������
            object_id: null, // id ������� ��������
            organization_id: null,
            gantt: false,
            // ������
            structure: {
                rows: null,
                positions: null,
                visual: null,
                field_names: {},
                temp: null,
                lookup: {},
                show_numeric: false
            },
            filters: {},
            // ���������
            pagination: {
                send: {
                    page: 1, // ������� ��������
                    order: 'd', // �����������
                    field: 'id', // ���� ����������
                    limit: 15, // ����� �����������
                    total: 0 // ����� �������
                },
                limit_array: [15, 20, 50, 100],
                limit_chart: 40
            },
            find: {},
            // �������
            access: {
                admin: null,
                users: null,
                columns: null,
                disable_deletion: '0'
            },
            // �������
            bill: {
                type: null,
                access: null
            },
            // ���������
            parameters: {
                created: null,
                modified: null,
                quota: null,
                used: null,
                oper_id: null,
                modifier_id: null
            },
        }
    };

    /** constructor */
    local.data = $.extend({}, base_structure);

    return {
        getListOfParams: function () {
            let rows = [];
            for (let i = 0; i < local.data.structure.positions.length; i++) {
                let row = local.data.structure.rows[local.data.structure.positions[i]];
                rows.push({
                    id: row.getId(),
                    name: row.getName(),
                    type: row.getTypeToEdit(),
                    visible: !row.getVisible(),
                    multiple: row.getIsMultiple(),
                    empty: !row.getEmpty()
                });
            }
            return rows;
        },
        getRow: function (id) {
            return local.data.structure.rows[id];
        },
        drawEditTable: function (row_id) {
            let self = this;
            let row = self.getRow(row_id);
            let lang = Lang.get()['crm']['edit'];
            new Windows({
                id: 'edit_row_' + row_id,
                title: row.getName(),
                sizes: {
                    height: '80%',
                    width: '80%'
                },
                buttons: {
                    save: {
                        title: lang['save'],
                        callback: function (win) {

                        },
                        additional_class: '--full --right'
                    },
                    cancel: {
                        title: lang['cancel'],
                        callback: function (win) {
                            win.hide();
                        },
                        additional_class: '--empty --right'
                    }
                },
                content: function () {
                    let parent = $('<div>');
                    parent.append(row.getContentToEditForm());
                    return parent;
                }(),
                no_scroll: false
            }).show();
        },
    };
};