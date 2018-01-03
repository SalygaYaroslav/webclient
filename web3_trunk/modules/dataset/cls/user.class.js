/**
 *
 * @param id
 * @returns {{classname: string, getEntityField: getEntityField, getDataToForm: getDataToForm, set: set, remove: remove, needFull: needFull, getId: getId, getLogin: getLogin, getName: getName, getAvatar: getAvatar, getUserOrganization: getUserOrganization, getUserGenderClass: getUserGenderClass, isEditable: isEditable, saveEntityToServer: saveEntityToServer, getFileTask: getFileTask}}
 * @constructor
 */
window.User = function (id) {
    let classname = 'User';
    let local = {
        entity: {}
    };
    // get from storages
    if (typeof id != 'undefined') {
        if (id == 'system') {
            local.entity = {};
        } else {
            local = Dataset.getEntity('user', id);
        }
    }
    let self = {
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
         * данные в форму
         * @param config конфиг данных
         * @returns {{}}
         */
        getDataToForm: function (config) {
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
            if (data.jobs.value.workexp.value.length == 1) {
                let workexp = $.extend({}, data.jobs.value.workexp.value[0]);
                let max_length = 0;
                for (let id in workexp) {
                    let length = workexp[id].value.split('\r').length;
                    if (length > max_length) {
                        max_length = length;
                    }
                }
                data.jobs.value.workexp.value = new Array(max_length);
                for (let i = 0; i < data.jobs.value.workexp.value.length; i++) {
                    data.jobs.value.workexp.value[i] = {
                        dtDateEnd: {
                            options: workexp['dtDateEnd'].options,
                            value: workexp['dtDateEnd'].value.split('\r')[i] || ''
                        },
                        dtDateStart: {
                            options: workexp['dtDateStart'].options,
                            value: workexp['dtDateStart'].value.split('\r')[i] || ''
                        },
                        vcJobs: {
                            options: workexp['vcJobs'].options,
                            value: workexp['vcJobs'].value.split('\r')[i] || ''
                        },
                        vcPosition: {
                            options: workexp['vcPosition'].options,
                            value: workexp['vcPosition'].value.split('\r')[i] || ''
                        },
                        vcReasons: {
                            options: workexp['vcReasons'].options,
                            value: workexp['vcReasons'].value.split('\r')[i] || ''
                        }
                    }
                }
            }
            console.log(data);
            return data;
        },
        /**
         * введем данные
         * @param user
         * @returns {User}
         */
        set: function (user) {
            let entities = Dataset.storage.data.entities['users'];
            let id = $('id', user).text();
            let login = Tool.decode($('login', user).text());
            Dataset.storage.data.logins[login] = id;
            if (typeof entities[id] == 'undefined') {
                local.entity = Tool.xmlToJson(user);
            } else {
                local = entities[id];
                local.entity = $.extend({}, entities[id].entity, Tool.xmlToJson(user));
            }
            entities[id] = local;
            return self;
        },
        /**
         * удалим из хранилища
         */
        remove: function () {
            let entities = Dataset.storage.data.entities['users'];
            let logins = Dataset.storage.data.logins;
            if (typeof logins[local.entity.login] != 'undefined') {
                delete logins[local.entity.login];
            }
            if (typeof entities[local.entity.id] != 'undefined') {
                delete entities[local.entity.id];
            }
        },
        /**
         * проверим, все ли данные загружены
         */
        needFull: function () {
            let result = Dataset.Tree.getFullUser(self);
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
        /**
         * получим ид
         * @returns {string|string}
         */
        getId: function () {
            return local.entity.id || '';
        },
        /**
         * получим логин
         * @returns {string|string}
         */
        getLogin: function () {
            return local.entity.login || '';
        },
        /**
         * получим имя
         * @returns {*}
         */
        getName: function () {
            try {
                if (typeof local.entity.vcRealName != 'undefined' && typeof local.entity.vcSurname != 'undefined') {
                    return local.entity.vcRealName + ' ' + local.entity.vcSurname;
                } else if (typeof local.entity.vcName != 'undefined') {
                    return local.entity.vcName;
                } else {
                    return local.entity.login;
                }
            } catch (e) {
                return '';
            }
        },
        /**
         * получим аватар
         * @returns {*}
         */
        getAvatar: function () {
            if (typeof local.entity.avatarName != 'undefined' && local.entity.avatarName) {
                return 'http://' + __web__.file_url + '/' + local.entity.avatarName;
            } else {
                let avatar = 'unknown';
                switch (self.getUserGenderClass()) {
                    case '1':
                        avatar = 'male';
                        break;
                    case '0':
                        avatar = 'female';
                        break;
                }
                return 'http://' + location.hostname + '/images/icons/userblock_' + avatar + '.svg';
            }
        },
        /**
         * получим список организаций юзера
         * @returns {Array}
         */
        getUserOrganization: function () {
            let org_ids = Dataset.Tree.getOrganizationIds();
            let org_array = [];
            for (let i = 0; i < org_ids.length; i++) {
                let org = Dataset.get('organization', org_ids[i]);
                if (org.isUserInTeam(self.getId())) {
                    org_array.push(org);
                }
            }
            return org_array;
        },
        /**
         * получим класс аватары
         * @returns {string}
         */
        getUserGenderClass: function () {
            let gender = local.entity.gender;
            let avatar = 'unknown';
            switch (gender) {
                case '1':
                    avatar = 'male';
                    break;
                case '0':
                    avatar = 'female';
                    break;
            }
            return avatar;
        },
        /**
         * проверка на права редактирования
         * @returns {boolean}
         */
        isEditable: function () {
            return local.entity.id == Authorization.getCurrentUser().getId();
        },
        /**
         * сохранение сущности на сервере
         * @param fields
         * @param callback
         */
        saveEntityToServer: function (fields, callback) {
            if (self.isEditable()) {
                let data_to_send = {};
                for (let id in fields) {
                    if (fields[id] != local.entity[id]) {
                        data_to_send[id] = fields[id];
                    }
                }
                if (Object.keys(data_to_send).length > 0) {
                    return Request.updateUser(self, data_to_send, function () {
                        local.entity = $.extend(local.entity, data_to_send);
                        Dataset.save();
                        if (typeof callback == 'function') {
                            callback();
                        }
                    });
                } else {
                    if (typeof callback == 'function') {
                        callback();
                    }
                }
            }
        },
        /**
         * получим задачу для сохранения персональных файлов
         * @returns {*}
         */
        getFileTask: function () {
            try {
                return Dataset.get('task', local.entity['files_task_id']);
            } catch (e) {
                return false;
            }
        }
    };

    self['vmData'] = {
        id: self.getId(),
        name: self.getName(),
        avatar: self.getAvatar(),
        userGenderClass: self.getUserGenderClass()
    };

    return self;
};