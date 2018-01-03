/**
 *
 * @param id
 * @returns {{classname: string, getEntityField: getEntityField, set: set, remove: remove, getId: getId, getName: getName, getUsers: getUsers, userInGroup: userInGroup}}
 * @constructor
 */
var Group = function (id) {
    /** private */
    let classname = 'Group';
    let local = {
        entity: null
    };
    /**
     * сделаем орг. по-умолчанию
     * @param id
     */
    let setDefaultOrgGroup = function (id) {
        let other_groups = Dataset.get('organization',id).getUserGroups();
        let user_ids = [];
        for (let i = 0; i < other_groups.length; i++) {
            let ids = other_groups[i].getUsers();
            user_ids = user_ids.concat(ids);
        }
        let all = Dataset.Tree.getUserIds(id);
        let result = all.difference(user_ids);
        local.entity = {
            userlist: [],
            id: 'default_' + id,
            name: Lang.get()['dataset']['group']['default']
        }
        local.entity.userlist = result.join(',');
    };
    /** constructor **/
    if (typeof id != 'undefined') {
        if (/default_/.test(id) == true) {
            setDefaultOrgGroup(id.replace('default_', ''));
        } else {
            local = Dataset.getEntity('group', id);
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
            return local.entity[field] || '';
        },
        /**
         * введем данные
         * @param group
         * @returns {Group}
         */
        set: function (group) {
            let entities = Dataset.storage.data.entities['groups'];
            let object = Tool.xmlAttrToJson(group);
            if (typeof entities[object.id] == 'undefined') {
                local.entity = object;
            } else {
                local = entities[object.id];
                local.entity = $.extend({}, entities[object.id].entity, object);
            }
            entities[object.id] = local;
            return this;
        },
        /**
         * удалим из хранилища
         */
        remove: function () {
            let entities = Dataset.storage.data.entities['groups'];
            if (typeof entities[local.entity.id] != 'undefined') {
                delete entities[local.entity.id];
            }
        },
        /**
         * получим ид
         * @returns {string|string}
         */
        getId: function () {
            return local.entity.id || '';
        },
        /**
         * получим имя
         * @returns {string}
         */
        getName: function () {
            return local.entity.name || '';
        },
        /**
         * получим список юзеров
         * @param asEntity
         * @returns {Array}
         */
        getUsers: function (asEntity) {
            try {
                let string_list = local.entity.userlist || '';
                let array_list = string_list.split(',').clean('');
                if (typeof asEntity == 'undefined') {
                    return array_list;
                } else {
                    let result = [];
                    for (let i = 0; i < array_list.length; i++) {
                        result.push(Dataset.get('user',array_list[i]));
                    }
                    return result;
                }
            } catch (e) {
                Notice.error(e);
            }
        },
        userInGroup: function (user) {
            let user_id = user.getId();
            let array_list = (local.entity.userlist || '').split(',').clean('');
            return array_list.indexOf(user_id) != '-1';
        }
    };
};