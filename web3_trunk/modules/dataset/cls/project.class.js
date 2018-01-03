/**
 *
 * @param id
 * @returns {{classname: string, getEntityField: getEntityField, set: set, remove: remove, getId: getId, getName: getName, getAvatar: getAvatar, isProject: isProject, isContactGroup: isContactGroup, isHomeProject: isHomeProject, getParentOrganization: getParentOrganization, getTasks: getTasks}}
 * @constructor
 */
var Project = function (id) {
    /** private **/
    let classname = 'Project';
    let local = {
        entity: {}
    };
    /** constructor **/
    if (typeof id != 'undefined') {
        local = Dataset.getEntity('project', id);
    }
    /** public **/
    return {
        classname: classname,
        /**
         * ������� ����
         * @param field
         * @returns {*|string}
         */
        getEntityField: function (field) {
            if (typeof field == 'undefined') {
                return local.entity;
            }
            return local.entity[field] || '';
        },
        /**
         * ������ ������
         * @param project
         * @returns {Project}
         */
        set: function (project) {
            let entities = Dataset.storage.data.entities['projects'];
            let id = $('id', project).text();
            if (typeof entities[id] == 'undefined') {
                local.entity = Tool.xmlToJson(project);
            } else {
                local = entities[id];
                local.entity = $.extend({}, entities[id].entity, Tool.xmlToJson(project));
            }
            // admin users
            local.entity.admin_users = [];
            $('admin_users > user', project).each(function (i, item) {
                local.entity.admin_users.push($(item).attr('id'));
            });
            // modify users
            local.entity.modify_users = [];
            $('modify_users > user', project).each(function (i, item) {
                local.entity.modify_users.push($(item).attr('id'));
            });// read users
            local.entity.read_users = [];
            $('read_users > user', project).each(function (i, item) {
                local.entity.read_users.push($(item).attr('id'));
            });
            entities[id] = local;
            return this;
        },
        /**
         * ������ �� ���������
         */
        remove: function () {
            let org_id = this.getParentOrganization().getId();
            let id = this.getId();
            let entities = Dataset.storage.data.entities['projects'];
            if (typeof entities[id] != 'undefined') {
                delete entities[id];
            }
            Dataset.Tree.deleteProject(org_id, id);
        },
        /**
         * ������� ��
         * @returns {string|string}
         */
        getId: function () {
            return local.entity.id || '';
        },
        /**
         * ������� ���
         * @returns {*}
         */
        getName: function () {
            // �������� �� �������� ������ ������� �����
            let isHomeProj = this.isHomeProject();
            if (isHomeProj == false) {
                return local.entity['vcName'] || '';
            } else {
                return Dataset.get('user',isHomeProj).getName() + ': ' + local.entity['vcName'].toLowerCase();
            }
        },
        /**
         * ������� ������
         * @returns {string}
         */
        getAvatar: function () {
            return '';
        },
        /**
         * �������� ������ �� ���
         * @returns {boolean}
         */
        isProject: function () {
            return local.entity['ptProjectType'] != '4';
        },
        /**
         * �������� ������ ��������� �� ���
         * @returns {boolean}
         */
        isContactGroup: function () {
            return local.entity['ptProjectType'] == '4';
        },
        /**
         * �������� �������� �� ��� ������
         * @returns {*}
         */
        isHomeProject: function () {
            if (local.entity['ptProjectType'] == '6' && local.entity['owner_person'] != Authorization.getUserAuthData().id) {
                return local.entity['owner_person'];
            } else {
                return false;
            }
        },
        /**
         * ������� ������������ �����������
         */
        getParentOrganization: function () {
            try {
                return Dataset.get('organization',local.entity['owner_org']);
            } catch (e) {
                return null;
            }
        },
        /**
         * ������� ������
         * @param callback
         */
        getTasks: function (callback) {
            let tasks = [];
            Dataset.Tree.getTaskIds(this.getParentOrganization().getId(), this.getId(), function (task_ids) {
                if (task_ids.length > 0) {
                    for (let i = 0; i < task_ids.length; i++) {
                        tasks.push(Dataset.get('task',task_ids[i]));
                    }
                }
                return callback(tasks);
            });
        },
        getTasksSync: function () {
            let task_ids = Dataset.Tree.getTaskSyncIds(this.getParentOrganization().getId(), this.getId());
            let tasks = [];
            if (task_ids.length > 0) {
                for (let i = 0; i < task_ids.length; i++) {
                    tasks.push(Dataset.get('task',task_ids[i]));
                }
            }
            return tasks;
        },
        isEditable: function () {
            return this.isEditableBy(Authorization.getCurrentUser().getId());
        },
        isEditableBy: function (uid) {
            if (this.getEntityField('owner_person') == uid) {
                return true;
            }
            if (this.getEntityField('owner_person') && this.getParentOrganization().isEditableBy(uid)) {
                return true;
            }
            if (this.getEntityField('admin_users')) {
                if (this.getEntityField('admin_users').indexOf(uid) != '-1') {
                    return true;
                }
            }
            return false;
        }
    };
};