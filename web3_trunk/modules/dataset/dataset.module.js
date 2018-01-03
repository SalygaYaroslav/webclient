/**
 *
 * @type {{Tree, storage, init, save, checkNews, parseNews, flushStorage, checkNotification, getCustomStorage, setCustomStorage, getEntity, getEntityFromServer, Tree}}
 */
window.Dataset = (function () {
    /** private */
    let storage = {
        key: Authorization.getUserAuthData('login'),
        time_delay: 0,
        time_title: '',
        timeout: null,
        data: {
            version: __web__.version,
            entities: {
                organizations: {},
                categorys: {},
                groups: {},
                projects: {},
                tasks: {},
                users: {}
            },
            logins: {},
            update: {
                last_id: '0',
                last_oper: '0',
                date: null,
                inprocess: false
            },
            storage_version: null,
            tree: {
                "other": {
                    c: {},
                    p: {},
                    g: {},
                    u: {}
                }
            }
        },
        runtime: {
            organizations: {},
            categorys: {},
            groups: {},
            projects: {},
            tasks: {},
            users: {}
        }
    };
    /** public */
    return {
        /** storage */
        storage: storage,
        /**
         * инициализация
         * @param callback калбек
         * @returns {*}
         */
        init: function (callback) {
            let data = $.jStorage.get('webclient.storage:' + storage.key);
            console.log(data);
            /** check data and version */
            if (data && data.version == __web__.version) {
                storage.data = data;
            }
            return callback(storage.data.update.last_id);
        },
        /**
         * save
         */
        save: function () {
            return $.jStorage.set('webclient.storage:' + storage.key, storage.data);
        },
        /**
         * проверим новости
         * @param callback калбек
         * @returns {boolean}
         */
        checkNews: function (callback) {
            let self = this;
            // check is news getting now
            if (storage.inprocess == true) {
                return false;
            }
            storage.inprocess = true;
            // get news
            self.getNews(callback);
        },
        /**
         * получим новости
         * @param callback
         */
        getNews: function (callback) {
            let self = this;
            Request.getNews(
                storage.data.update.last_id,
                function (data) { // success
                    let news_object = data.object();
                    if (news_object['_status'] == 'OK') {
                        storage.inprocess = false;
                        if (storage.timeout) {
                            window.clearTimeout(storage.timeout);
                        }
                        storage.timeout = window.setTimeout(function () {
                            self.checkNews();
                        }, 60000);
                        self.parseNews(data);
                        if (typeof callback == 'function') {
                            callback();
                        }
                    } else {
                        // error(data);
                    }
                }
            );
        },
        /**
         * парсим данные по новостям
         * @param news
         */
        parseNews: function (news) {
            let xml = news.xml();
            let update = storage.data.update;
            let entities = storage.data.entities;
            // delay
            storage.time_delay = moment($('news', xml).attr('server_time')).diff(moment(), 'hours');
            storage.time_title = moment().format("DD.MM.YYYY HH:mm:ss");
            // go go go
            let sound = false;
            for (let id in entities) {
                if (entities.hasOwnProperty(id)) {
                    let entity_type = id.substring(0, id.length - 1);
                    $(entity_type + 's > ' + entity_type, xml).each(function (i, entity) {
                        let entity_object = new window[entity_type.capitalize()]().set(entity);
                        switch (entity_type) {
                            case 'task':
                                if (Router.getPage() == 'projects') {
                                    let params = Router.getParams();
                                    let id = entity_object.getId();
                                    if (params.length > 1 && params[1] == id) {
                                        $(document).trigger('webclient.comments.update.' + id);
                                    }
                                }
                                sound = true;
                                break;
                        }
                    });
                }
            }
            $('comvotes > comvote', xml).each(function (i, vote) {
                let task_id = $('task_id', vote).text();
                // если сейчас открыта лента комментов этой задачи, то
                // обновляем ленту
                if (Router.getPage() == 'projects') {
                    let params = Router.getParams();
                    if (params.length > 1 && params[1] == task_id) {
                        $(document).trigger('webclient.comments.vote', vote);
                    }
                }
            });
            if ($('losts', xml).length > 0) {
                for (let id in entities) {
                    if (entities.hasOwnProperty(id)) {
                        let entity_type = id.substring(0, id.length - 1);
                        if ($('losts > ' + entity_type + 's', xml).length > 0) {
                            let ids = $('losts > ' + entity_type + 's', xml).text().split(',');
                            for (let i = 0; i < ids.length; i++) {
                                let object_entity = new window[entity_type.capitalize()](ids[i]);
                                object_entity.remove();
                            }
                        }
                    }
                }
            }
            if ($('news', xml).attr('last') != 'nope') {
                update.last_oper = update.last_id;
                update.last_id = $('news', xml).attr('last');
            }
            // дерево
            Dataset.Tree.buildTree(xml);
            this.save();
            if (sound) {
                Tool.playAudio('/sounds/inbox.news.mp3');
            }
        },
        /**
         * очистка хранилища
         */
        flushStorage: function () {
            $.jStorage.flush();
            window.location.reload();
        },
        // /**
        //  * проверка уведомлений
        //  * @param tasks задачи
        //  * @param comments комменты
        //  * @param crmobjects црмобъекты
        //  * @returns {boolean}
        //  */
        // checkNotification: function (tasks, comments, crmobjects) {
        //     let task_ids = [];
        //     for (let i = 0; i < tasks.length; i++) {
        //         task_ids.push(tasks[i].id + ':' + storage.data.update.last_oper);
        //     }
        //     // task_ids = task_ids.join(',');
        //     return true;
        // }
        /**
         * получаем модульное хранилище
         * @param storage_name название модуля
         */
        getCustomStorage: function (storage_name) {
            return $.jStorage.get('webclient.' + storage_name + ':' + storage.key);
        },
        /**
         * вводим модульное хранилище
         * @param storage_name название модуля
         * @param storage_object объект модуля
         */
        setCustomStorage: function (storage_name, storage_object) {
            $.jStorage.set('webclient.' + storage_name + ':' + storage.key, storage_object);
        },
        /**
         * получим сущность из хранилища
         * если нет в хранилище - заберем с сервера
         * если нет на сервере - вернем null
         * @param type_ тип сущности
         * @param id_ id сущности
         * @returns {*}
         */
        getEntity: function (type_, id_) {
            let self = this;
            if (typeof type_ != 'undefined' && typeof id_ != 'undefined') {
                if (typeof storage.data.entities[type_ + 's'] != 'undefined' && typeof storage.data.entities[type_ + 's'][id_] != 'undefined') {
                    return storage.data.entities[type_ + 's'][id_];
                } else {
                    return self.getEntityFromServer(type_, id_, function (type_, id_, data_) {
                        if (!data_) {
                            return null;
                        }
                        let xml = data_.xml();
                        if (typeof xml == 'undefined' || $('denied', xml).text() == true) {
                            return null;
                        }
                        $(type_, xml).each(function (i, item) {
                            new window[type_.capitalize()]().set(item);
                        });
                        // сохраним
                        self.save();
                        // заново вернем
                        if (typeof storage.data.entities[type_ + 's'] != 'undefined' && typeof storage.data.entities[type_ + 's'][id_] != 'undefined') {
                            return storage.data.entities[type_ + 's'][id_];
                        } else {
                            return null;
                        }
                    });
                }
            } else {
                return null;
            }
        },
        /**
         * получим сущность с сервера
         * @param {string} type тип сущности
         * @param {int} id id сущности
         * @param {function} callback калебэк
         * @returns {*}
         */
        getEntityFromServer: function (type, id, callback) {
            switch (type) {
                case 'job':
                    break;
                default:
                    return callback(type, id, Request.getEntity(type, id));
                    break;
            }
        },
        loadTasks: function (callback) {
            let array = [];
            let organizations = Authorization.getCurrentUser().getUserOrganization();
            for (let i = 0; i < organizations.length; i++) {
                let projects = organizations[i].getProjects();
                array = array.concat(projects);
                let groups = organizations[i].getContactsGroup();
                array = array.concat(groups);
            }
            array = array.concat(Dataset.get('organization', 'other').getProjects());
            this.lazyLoad(array, callback);
        },
        lazyLoad: function (array, callback) {
            let self = this;
            let lang = Lang.get()['dataset'];
            if (array.length > 0) {
                let name = array[0].getName();
                let type = array[0].isContactGroup();
                Interface.Load.show(lang['loading'] + ((type) ? ' ' + lang['contacts'] + ' ' : ' ' + lang['tasks'] + ' ' ) + name);
                array[0].getTasks(function () {
                    array.cleanByIndex(0);
                    self.lazyLoad(array, callback);
                })
            } else {
                callback();
            }
        },
        getSizes: function () {
            let xLen, log = [], total = 0;
            for (let x in localStorage) {
                if (localStorage.hasOwnProperty(x)) {
                    xLen = ((localStorage[x].length * 2 + x.length * 2) / 1024);
                    total += xLen
                }
            }
            log.unshift("Текущий<br>размер БД<br> " + Tool.formatBytes(total));
            return log.join("\n");
        },
        get: function (type, id) {
            if (id == '') {
                return false;
            }
            let entity = false;
            try {
                if (type == 'user' && /[a-zA-Z]/gi.test(id) == true) {
                    entity = Dataset.Tree.getUserByLogin(id);
                } else {
                    entity = storage.runtime[type + 's'][id];
                }
            }
            catch (e) {
                console.log(e);
            }
            if (entity == undefined) {
                try {
                    entity = storage.runtime[type + 's'][id] = new window[type.capitalize()](id);
                }
                catch (e) {
                    console.log(e);
                }
            }
            return entity;
        }
    };
})();