/**
 *
 * @param id
 * @returns {{classname: string, getEntityField: getEntityField, set: set, remove: remove, getId: getId, getName: getName, getAvatar: getAvatar, getProjects: getProjects, getContactsGroup: getContactsGroup, getUserGroups: getUserGroups, isUserInTeam: isUserInTeam, getUsers: getUsers, getStatus: getStatus, getStatusAvatarClass: getStatusAvatarClass, isAdmin: isAdmin, checkProjectsDifference: checkProjectsDifference, getCategories: getCategories, getRouters: getRouters, userInFired: userInFired}}
 * @constructor
 */
var Organization = function (id) {
    /** private **/
    let classname = 'Organization';
    let local = {
        entity: {},
        group_access: {},
        admin_group_access: {},
        admins: {}
    };
    /** constructor **/
    if (typeof id != 'undefined') {
        if (id == 'other') {
            local.entity = {
                id: 'other',
                title: Lang.get()['dataset']['org']['private']
            };
        } else {
            local = Dataset.getEntity('organization', id);
        }
    }
    /** public **/
    return {
        classname: classname,
        /**
         * получим поле
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
         * введем данные
         * @param organization
         * @returns {Organization}
         */
        set: function (organization) {
            let entities = Dataset.storage.data.entities['organizations'];
            let id = $('id', organization).text();
            if (typeof entities[id] == 'undefined') {
                local.entity = Tool.xmlToJson(organization);
            } else {
                local = entities[id];
                local.entity = $.extend({}, entities[id].entity, Tool.xmlToJson(organization));
                /** проверка на изменения в доступах проектов**/
                // this.checkProjectsDifference();
            }
            if ($('groups', organization).length > 0) {
                Dataset.Tree.clearOrganizationGroups(id);
            }
            $('groups > group', organization).each(function (i, group) {
                Dataset.get('group',).set(group);
            });
            /** admins **/
            $('admins > user', organization).each(function (i, admin) {
                let id = $(admin).attr('id');
                local.admins[id] = {};
                local.admins[id]['creator'] = ($(admin).attr('creator') || 'false').toBoolean();
                local.admins[id]['spec_access'] = $(admin).attr('spec_access') || null;
                if ($('user_data', admin).length > 0) {
                    local.admins[id]['user_data'] = Tool.xmlToJson(admin)['user_data'];
                }
            });
            $('clients_groups > group', organization).each(function (i, group) {
                let group_object = Tool.xmlAttrToJson(group);
                local.group_access[group_object.id] = group_object;
            });
            $('admins_groups > group', organization).each(function (i, group) {
                let group_object = Tool.xmlAttrToJson(group);
                local.admin_group_access[group_object.id] = group_object;
            });
            entities[id] = local;
            return this;
        },
        /**
         * удалим из хранилища
         */
        remove: function () {
            try {

                let entities = Dataset.storage.data.entities['organizations'];
                if (typeof entities[local.entity.id] != 'undefined') {
                    delete entities[local.entity.id];
                }
            } catch (e) {
                console.log(e);
            }
        },
        /**
         * получим ид
         * @returns {string|string}
         */
        getId: function () {
            if (!local) {
                return '';
            }
            return local.entity.id || '';
        },
        /**
         * получим имя
         * @returns {string|string}
         */
        getName: function () {
            return local.entity.title || Lang.get()['dataset']['org']['no_name'];
        },
        /**
         * получим аватар
         * @returns {*}
         */
        getAvatar: function () {
            if (typeof local.entity.avatarName != 'undefined') {
                return 'https://' + __web__.file_url + '/' + local.entity.avatarName;
            } else {
                return false;
            }
        },
        /**
         * получим проекты
         * @returns {Array}
         */
        getProjects: function () {
            let projects = [];
            let project_ids = Dataset.Tree.getProjectIds(this.getId());
            for (let i = 0; i < project_ids.length; i++) {
                let project = Dataset.get('project',project_ids[i]);
                if (project.isProject()) {
                    projects.push(project);
                }
            }
            return projects;
        },
        /**
         * получим группы контактов
         * @returns {Array}
         */
        getContactsGroup: function () {
            let groups = [];
            let group_ids = Dataset.Tree.getProjectIds(this.getId());
            for (let i = 0; i < group_ids.length; i++) {
                let group = Dataset.get('project',group_ids[i]);
                if (group.isContactGroup()) {
                    groups.push(group);
                }
            }
            return groups;
        },
        /**
         * получим группы пользователей
         * @param with_default
         * @param no_fired
         * @returns {Array}
         */
        getUserGroups: function (with_default, no_fired) {
            let group_ids = Dataset.Tree.getGroupIds(this.getId());
            let result = [];
            for (let i = 0; i < group_ids.length; i++) {
                let group = Dataset.get('group',group_ids[i]);
                result.push(group);
                if (no_fired && this.groupIsFired(group)) {
                    continue;
                }
            }
            if (typeof with_default != 'undefined') {
                result.push(Dataset.get('group','default_' + this.getId()));
            }
            return result;
        },
        getAdminGroups: function () {
            let group_ids = Object.keys(local.admin_group_access);
            let result = [];
            for (let i = 0; i < group_ids.length; i++) {
                result.push(Dataset.get('group',group_ids[i]));
            }
            return result;
        },
        /**
         * проверим юзера в организации
         * @param user_id
         * @returns {boolean}
         */
        isUserInTeam: function (user_id) {
            let users_array = Dataset.Tree.getUserIds(this.getId());
            return ($.inArray(user_id, users_array) != '-1');
        },
        /**
         * получим список юзеров организации
         * @returns {Array}
         */
        getUsers: function () {
            let users_array = [];
            let ids_array = Dataset.Tree.getUserIds(this.getId());
            for (let i = 0; i < ids_array.length; i++) {
                users_array.push(Dataset.get('user',(ids_array[i])));
            }
            return users_array;
        },
        /**
         * получим статус
         * @returns {*|string|number}
         */
        getStatus: function () {
            return local.entity.status;
        },
        /**
         * получим статус аватар
         * @returns {string}
         */
        getStatusAvatarClass: function () {
            let status = 'standart';
            switch (this.getStatus()) {
                case 'prof':
                    status = 'prof';
                    break;
                case 'standart':
                    if (this.isAdmin()) {
                        status = 'admin';
                    }
                    break;
            }
            return status;
        },
        /**
         * проверка на админа
         * @param id
         * @returns {boolean}
         */
        isAdmin: function (id) {
            let uid = id || Authorization.getCurrentUser().getId();
            for (let id in local.admin_group_access) {
                let group = Dataset.get('group',id);
                if ($.inArray(uid, group.getUsers()) != "-1") {
                    return true;
                }
            }
            return (typeof local.admins[uid] != 'undefined' || local.entity.ownerId == uid);
        },
        /**
         *
         * @param id
         * @returns {string}
         */
        getUserSign: function (id) {
            let sign = '';
            if (typeof id == 'undefined') {
                id = Authorization.getCurrentUser().getId();
            }
            if (typeof local.admins[id] != 'undefined') {
                if (typeof local.admins[id]['user_data'] != 'undefined' && typeof local.admins[id]['user_data']['u_mail_postfix'] != 'undefined') {
                    sign = local.admins[id]['user_data']['u_mail_postfix'];
                }
            }
            return sign;
        },
        /**
         * проверим различия списка проектов
         * @returns {{}}
         */
        checkProjectsDifference: function () {
            let projects = Request.loadOrgProjects(this.getId());
            let projects_array = projects.xml();
            let new_ids = [];
            let temp_projects = {};
            $('project', projects_array).each(function (i, item) {
                let project = Tool.xmlToJson(item);
                new_ids.push(project.id);
                temp_projects[project.id] = project;

            });
            let old_ids = Dataset.Tree.getProjectIds(this.getId());
            let diff = {
                to_add: [],
                to_remove: []
            };
            diff.to_remove = old_ids.difference(new_ids);
            if (to_remove.length > 0) {
                for (let i = 0; i < to_remove.length; i++) {
                    Dataset.get('project',to_remove[i]).remove();
                }
            }
            diff.to_add = new_ids.difference(old_ids);
            if (diff.to_add.length > 0) {
                for (let i = 0; i < diff.to_add.length; i++) {
                    Dataset.get('project',).set(temp_projects[diff.to_add[i]]);
                }
            }
            return diff;
        },
        /**
         * получим категории
         * @returns {Array}
         */
        getCategories: function () {
            let category_ids = Dataset.Tree.getCategoryIds(this.getId());
            let categories = [];
            for (let i = 0; i < category_ids.length; i++) {
                categories.push(Dataset.get('category',category_ids[i]));
            }
            return categories;
        },
        getRouters: function () {
            let response = Request.getRouters(this.getId());
            let xml = response.xml();
            let gateways = [];
            $('mailgateway', xml).each(function () {
                gateways.push(Tool.xmlToJson(this));
            });
            return gateways;
        },
        groupIsFired: function (group) {
            if (local.entity['dismissed_group_id'] && local.entity['dismissed_group_id'] != '' && local.entity['dismissed_group_id'] != '0') {
                return local.entity['dismissed_group_id'] == group.getId();
            }
        },
        userInFired: function (user) {
            //сначала смотрим есть ли айди группы уволенных
            if (local.entity['dismissed_group_id'] && local.entity['dismissed_group_id'] != '' && local.entity['dismissed_group_id'] != '0') {
                return Dataset.get('group',local.entity['dismissed_group_id']).userInGroup(user);
            }
            return false;
        },
        isEditable: function () {
            return this.isEditableBy(Authorization.getCurrentUser().getId());
        },
        isEditableBy: function (uid) {
            let admin_groups = this.getAdminGroups();
            for (let i = 0; i < admin_groups.length; i++) {
                if (admin_groups[i].userInGroup(Dataset.get('user',uid))) {
                    return true;
                }
            }
            if (this.getEntityField('ownerId') == uid || typeof local.admins[uid] != 'undefined') {
                return true;
            }
            return false;
        }
    };
};