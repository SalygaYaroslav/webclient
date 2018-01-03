/**
 *
 * @type {{Form, Params, init, getUserAuthData, setUserAuthData, getLoginToServer, getStorageConfig, setUserData, getUserData, getCurrentUser, logout, getLocalData}}
 */
var Authorization = (function () {
    /** private */
    let local = {
        login: '',
        password: '',
        timeZone: '',
        config: {},
        storage_config: {
            show_comment_image_preview: true,
            show_comment_email_as_text: true,
            show_comment_category_full: false
        }
    };
    /** public */
    return {
        /**
         * загружаем приложение
         * @param callback калбек функция
         * @returns {*}
         */
        init: function (callback) {
            let data_from_cookie = Cookies.getJSON('webapp_user');
            if (data_from_cookie != undefined) {
                local.login = data_from_cookie.login;
                local.password = data_from_cookie.password;
            }
            if (local.login && local.password) {
                return Authorization.Form.forceLogin(local.login, local.password, callback);
            } else {
                return Authorization.Form.init(callback);
            }
        },
        /**
         * загружаем приложение
         * @param field field какое именно поле надо получить из авторизации
         * @returns {*} если undefined, то вернет логин и пароль, иначе - поле из авторизации
         */
        getUserAuthData: function (field) {
            if (typeof field != 'undefined' && typeof local[field] != 'undefined') {
                return local[field];
            }
            return {login: local.login, password: local.password};
        },
        /**
         * добавим куки юзера
         * @param login
         * @param password
         * @returns {boolean}
         */
        setUserAuthData: function (login, password) {
            local.login = login;
            local.password = password;
            Cookies.set('webapp_user', {login: local.login, password: local.password});
            return true;
        },
        /**
         * отправим данные на сервер
         * @param username
         * @param password
         * @param success
         * @param error
         */
        getLoginToServer: function (username, password, success, error) {
            let self = this;
            let result = 0;
            if (typeof username == 'undefined' || username == '') {
                result += 1;
            }
            if (typeof password == 'undefined' || password == '') {
                result += 2;
            }
            if (result > 0) {
                if (typeof error != 'undefined') {
                    error(result);
                }
            } else {
                if (/^\%.*/gi.test(password) == false) {
                    password = '%' + md5(password);
                }
                Request.auth(username, password, function (data) {
                    let xml = data.xml();
                    if (xml.attr('status') == 'error') {
                        error(4);
                    } else if (xml.attr('status') == 'OK') {
                        self.setUserAuthData(username, password);
                        success(self.setUserData(data));
                    }
                });
            }
        },
        /**
         * получим данные конфига из хранилища
         * @param key
         * @returns {*}
         */
        getStorageConfig: function (key) {
            if (typeof key != 'undefined' && typeof local.storage_config[key] != 'undefined') {
                return local.storage_config[key];
            }
            return null;
        },
        /**
         * после авторизации обработаем данные
         * @param xmlobject
         * @returns {{}|*}
         */
        setUserData: function (xmlobject) {
            let data = xmlobject.object();
            let config = local.config = {};
            // servers
            if ($.type(data.servers.server) != 'array') {
                config['servers'] = [data.servers.server];
            } else {
                config['servers'] = data.servers.server;
            }
            for (let i = 0; i < config['servers'].length; i++) {
                Request.addServer(config['servers'][i]);
            }
            // urls
            config['urls'] = {
                base_domain: data.base_domain,
                cms_domain: data.cms_domain,
                exim_mailserver_domain: data.exim_mailserver_domain,
                file_domain: data.file_domain,
                jabber_domain: data.jabber_domain,
                jabber_server: data.jabber_server,
                sip_domain: data.sip_domain
            };
            // user_props
            config['user_props'] = {};
            for (let id in data.user_props) {
                if (data.user_props.hasOwnProperty(id)) {
                    config.user_props[id.replace(/^_/gi, '')] = data.user_props[id];
                }
            }
            // settings
            config.user_props.settings = Tool.stringToJson(config.user_props.settings, 'settings');
            // personal settings
            config.user_props.personal_settings = Tool.stringToJson(config.user_props.personal_settings);
            // name
            config.user_props.user_name = data.user_name;
            // quotas
            config['quotas'] = {};
            for (let id in data.stat) {
                if (data.stat.hasOwnProperty(id)) {
                    config.quotas[id] = data.stat[id];
                }
            }
            // system
            config['system'] = {};
            for (let id in data.system) {
                if (data.system.hasOwnProperty(id)) {
                    config.system[id.replace(/^_/gi, '')] = data.system[id];
                }
            }
            // pays
            config['pays'] = {};
            config.pays.sms_tariff_other_directions = data.sms_tariff_other_directions;
            // timezone
            local.timeZone = parseInt(data.system['_date'].split(' ')[1].split(':')[0]) + new Date().getTimezoneOffset() / 60;
            return config.user_props;
        },
        /**
         * получим данные
         * @param field
         * @returns {*}
         */
        getUserData: function (field) {
            if (typeof field != 'undefined' && typeof local.config[field] != 'undefined') {
                return local.config[field];
            }
            return local.config;
        },
        /**
         * получим текущего юзера
         * @returns {User}
         */
        getCurrentUser: function () {
            return Dataset.get('user', local.config.user_props.id);
        },
        /**
         * логаут
         */
        logout: function () {
            Cookies.set('webapp_user', {login: '', password: ''});
            window.location.reload();
        },
        timeZone: function () {
            return local.timeZone || 0;
        },
        /**
         * получим локальные данные, для отладки
         * @returns {{login: string, password: string, config: {}, storage_config: {show_comment_image_preview: boolean, show_comment_email_as_text: boolean, show_comment_category_full: boolean}}}
         */
        getLocalData: function () {
            return local;
        },
        getPersonalWebConfig: function () {
            return local.config.user_props.settings.settings;
        },
        personalWebConfig: function (field, value) {
            if (typeof field == 'undefined') {
                return false;
            }
            let data = this.getPersonalWebConfig();
            if (typeof value == 'undefined') {
                if (typeof data[field] != 'undefined') {
                    return data[field];
                } else {
                    return false;
                }
            } else {
                if (typeof data[field] != 'undefined') {
                    return data[field] = value;
                } else {
                    return false;
                }
            }
        },
        getJabberConnectionData: function (type) {
            if (typeof type != 'undefined' && typeof local.config.urls['jabber_' + type] != 'undefined') {
                return local.config.urls['jabber_' + type];
            } else {
                return null;
            }
        }
    };
})();
