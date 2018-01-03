/**
 *
 * @param id
 * @returns {{classname: string, getEntityField: getEntityField, set: set, remove: remove, getId: getId, getName: getName}}
 * @constructor
 */
var Category = function (id) {
    /** private **/
    let classname = 'Category';
    let local = {
        entity: {}
    };
    /** constructor **/
    if (typeof id != 'undefined') {
        if (id != '0') {
            local = Dataset.getEntity('category', id);
        } else {
            local.entity = {
                cat_color: 'ffffff',
                cat_title: Lang.get()['dataset']['category']['no_name'],
                id: '0',
                owner_type: 'base',
            };
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
         * @param category
         * @returns {Category}
         */
        set: function (category) {
            let entities = Dataset.storage.data.entities['categorys'];
            let id = $('id', category).text();
            if (typeof entities[id] == 'undefined') {
                local.entity = Tool.xmlToJson(category);
            } else {
                local = entities[id];
                local.entity = $.extend({}, entities[id].entity, Tool.xmlToJson(category));
            }
            entities[id] = local;
            return this;
        },
        /**
         * удалим с хранилища
         */
        remove: function () {
            if (this.getId() == '0') {
                return false;
            }
            let org = this.getParentOrganization();
            if (org != false) {
                Dataset.Tree.deleteCategory(org.getId(), this.getId());
            }
            let entities = Dataset.storage.data.entities['categorys'];
            if (typeof entities[local.entity.id] != 'undefined') {
                delete entities[local.entity.id];
            }
        },
        /**
         * получаем родительскую организацию
         * @returns {*}
         */
        getParentOrganization: function () {
            console.log(local.entity);
            if (local.entity.owner_type == 'org') {
                return Dataset.get('organization',local.entity.owner_id);
            }
            return false;
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
         * @returns {*|string}
         */
        getName: function () {
            return local.entity.cat_title || '';
        },
        /**
         * получим цвет
         * @returns {*|string}
         */
        getColor: function () {
            return '#' + local.entity.cat_color || '';
        }
    }
};