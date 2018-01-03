/**
 *
 * @param id
 * @returns {{classname: string, getEntityField: getEntityField, set: set, remove: remove, getId: getId, getName: getName, isContact: isContact}}
 * @constructor
 */
var Task = function (id) {
    /** private **/
    let classname = 'Task';
    let local = {
        entity: {},
        contact: null
    };
    /** constructor **/
    if (typeof id != 'undefined') {
        let dataset = Dataset.getEntity('task', id);
        if (dataset != null) {
            local = dataset;
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
         * @param task
         * @returns {Task}
         */
        set: function (task) {
            let self = this;
            let entities = Dataset.storage.data.entities['tasks'];
            let id = $('id', task).text();
            if (typeof entities[id] == 'undefined') {
                local.entity = Tool.xmlToJson(task);
            } else {
                local = entities[id];
                local.entity = $.extend({}, entities[id].entity, Tool.xmlToJson(task));
            }
            if (local.entity && local.entity['xmlContact']) {
                try {
                    local.contact = Tool.stringToJson(local.entity['xmlContact']).contact;
                } catch (e) {
                    console.log(e);
                }
            }
            entities[id] = local;
            return self;
        },
        /**
         * удалим из хранилища
         */
        remove: function () {
            let self = this;
            let project = self.getParentProject();
            let org = project.getParentOrganization();
            Dataset.Tree.deleteTask(org.getId(), project.getId(), self.getId());
            let entities = Dataset.storage.data.entities['tasks'];
            let id = self.getId();
            if (typeof entities[id] != 'undefined') {
                delete entities[id];
            }
        },
        /**
         * получим ид
         * @returns {string}
         */
        getId: function () {
            return (local.entity != null) ? local.entity.id : '';
        },
        /**
         * получим родительский проект
         * @returns {Project}
         */
        getParentProject: function () {
            return Dataset.get('project',local.entity['projectid']);
        },
        /**
         * получим имя
         * @returns {string}
         */
        getName: function () {
            let self = this;
            let name = '';
            let lang = Lang.get()['dataset']['task'];
            if (self.isContact() == true) {
                name = ((local.contact["contact-person"] != "0") ? local.contact["name"] : local.contact["org-title"]);
                if (!name) {
                    name = local.contact['email'] || '';
                }
                if (!name) {
                    name = local.contact['skype'] || '';
                }
                if (!name) {
                    name = local.entity['vcName'] || lang['empty_contact'];
                }
            } else {
                name = local.entity['vcName'] || lang['no_name'];
            }
            return name;
        },
        contactHasEmail: function () {
            try {
                return local.contact['email'] || false;
            } catch (e) {
                return false;
            }
        },
        /**
         * получим автора
         * @returns {*}
         */
        getAuthor: function () {
            try {
                return Dataset.Tree.getUserByLogin(local.entity['vcTo']);
            } catch (e) {
                return '';
            }

        },
        setAuthor: function (login) {
            local.entity['vcTo'] = login || '';
            Dataset.save();
        },
        /**
         * получим имя автора
         * @returns {*}
         */
        getAuthorName: function () {
            let self = this;
            try {
                return self.getAuthor().getName();
            } catch (e) {
                return '';
            }
        },
        /**
         * проверим контакт ли это
         * @returns {boolean}
         */
        isContact: function () {
            return local.contact != null;
        },
        needFull: function () {
            let self = this;
            let result = Dataset.Tree.getFullTask(self);
            switch (result) {
                case true:
                    break;
                case false:
                    break;
                default:
                    self = result;
                    break;
            }
        },
        getGateways: function () {
            let self = this;
            self.needFull();
            try {
                let object = Tool.stringToJson(local.entity['gateway_send_settings']);
                let settings = object['settings'];
                if (settings['send_from_gateway'] == '') {
                    settings['send_from_gateway'] = '0';
                }
                return settings;
            } catch (e) {
                return false;
            }
        },
        saveGateway: function (gateway_send_settings, callback) {
            let self = this;
            local.entity['gateway_send_settings'] = Tool.jsonToXmls({settings: gateway_send_settings});
            Request.saveTaskGatewaySettings(self, callback);
        },
        isUserReader: function (user) {
            let self = this;
            self.needFull();
            let particular_users = self.getEntityField('particular_users');
            let speakers = self.getEntityField('speakers');
            let writers = self.getEntityField('writers');
            let id = user.getId();
            //проверяем есть ли у пользователя доступ к задаче
            //если пользователь есть в task.particular_users
            if (particular_users && $.inArray(id, particular_users.split(',')) != -1) {
                return true;
            }
            //если пользователь есть в task.speakers(кто отписывался в задаче) и нет в task.writers(кому были персональные комменты в задаче)
            if ((speakers && $.inArray(id, speakers.split(',')) != -1) && (!writers || $.inArray(id, writers.split(',')) == -1)) {
                return true;
            }
            //если у пользователя есть доступ к проекту
            try {
                let project = self.getParentProject();
                if (project.getEntityField('admin_users').indexOf(id) != '-1') {
                    return true; // в админах
                }
                if (project.getEntityField('modify_users').indexOf(id) != '-1') {
                    return true; // в пользовтелях с доступом на изменение
                }
                if (project.getEntityField('read_users').indexOf(id) != '-1') {
                    return true; // в пользовтелях с доступом на чтение
                }
                //если пользователь является админом организации
                let org = project.getParentOrganization();
                if (org.isAdmin(id)) {
                    return true;
                }
            } catch (e) {
                console.log(e);
            }
            return false;
        },
        getGuid: function () {
            let self = this;
            self.needFull();
            return self.getEntityField('guid');
        },
        isEditable: function () {
            let self = this;
            return self.isEditableBy(Authorization.getCurrentUser().getId());
        },
        isEditableBy: function (uid) {
            let self = this;
            return (
                self.getEntityField('ownerid') === uid
                || Dataset.get('organization',self.getEntityField('org_id')).isEditableBy(uid)
                || Dataset.get('project',self.getEntityField('projectid')).isEditableBy(uid)
            );
        },
        /**
         * данные в форму
         * @param config конфиг данных
         * @returns {{}}
         */
        getDataToForm: function (config) {
            let self = this;
            self.needFull();
            let data = {};
            let parse_array = function (data, array) {
                for (let i = 0; i < array.length; i++) {
                    let arrg = array[i];
                    let id = arrg.options.id;
                    let type = arrg.options.type;
                    switch (type) {
                        case 'section':
                            if ((arrg.options.multi || 'false').toString().toBoolean()) {
                                data[id] = {
                                    options: arrg.options,
                                    value: [{}]
                                };
                                parse_array(data[id].value[0], arrg.children);
                            } else {
                                data[id] = {
                                    options: arrg.options,
                                    value: {}
                                };
                                parse_array(data[id].value, arrg.children);
                            }
                            break;
                        default:
                            if ((arrg.options.multi || 'false').toString().toBoolean()) {
                                data[id] = {
                                    options: arrg.options,
                                    value: (local.entity[id] || '').split(arrg.options.split || ',')
                                };
                            } else {
                                data[id] = {
                                    options: arrg.options,
                                    value: (local.entity[id] || '')
                                };
                            }
                            break;
                    }
                }
            };
            parse_array(data, config);
            return data;
        },
    };
};