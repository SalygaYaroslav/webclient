/**
 * Роутинг
 * @type {{spy, changeTitle, initStorage, saveStorage, goToUrl, changeParams, getPage, getParams, deleteTask, addTask, openLink}}
 */
var Router = (function () {
    /** private */
    let storage = {
        history: []
    };
    let last_page = '';
    let last_param = [];

    /** public */
    return {
        /**
         * шпионим за сменой хеша
         * если его поменяли - значит меняем сцену\параметры
         */
        spy: function () {
            // инициализируем историю
            this.initStorage();
            let hash = window.location.hash.replace(/^#/, '');
            if (hash == '') {
                window.location.hash = '#main';
                hash = 'main';
            }
            let path = hash.split('::');
            let page = path.splice(0, 1)[0];
            try {
                if (page != last_page) {
                    last_page = page;
                    last_param = path;
                    Scene.changeScene(page, path);
                } else {
                    last_param = path;
                    Scene.changeParam(page, path);
                }
                this.changeTitle();
            } catch (e) {
                console.error('url trouble', e);
            }
        },
        /**
         * смена тайтла браузера
         */
        changeTitle: function () {
            setTimeout(function () {
                let title = '';
                switch (last_page) {
                    case 'projects':
                        title = 'ПБ > Проекты';
                        switch (last_param.length) {
                            case 1:
                                title = 'ПБ > ' + Dataset.get('project',last_param[0]).getName();
                                break;
                            case 2:
                                title = 'ПБ > ' + Dataset.get('task',last_param[1]).getName();
                                break;
                        }
                        break;
                    case 'users':
                        title = 'ПБ > Пользователи';
                        switch (last_param.length) {
                            case 1:
                                title = 'ПБ > ' + Dataset.get('group',last_param[0]).getName();
                                break;
                            case 2:
                                title = 'ПБ > ' + Dataset.get('user',last_param[1]).getName();
                                break;
                        }
                        break;
                    case 'contacts':
                        title = 'ПБ > Контакты';
                        switch (last_param.length) {
                            case 1:
                                title = 'ПБ > ' + Dataset.get('project',last_param[0]).getName();
                                break;
                            case 2:
                                title = 'ПБ > ' + Dataset.get('task',last_param[1]).getName();
                                break;
                        }
                        break;
                    case 'calendar':
                        title = 'ПБ > Календарь';
                        break;
                    case 'crm':
                        title = 'ПБ > CRM-таблицы';
                        break;
                    case 'video':
                        title = 'ПБ > Видеоконференции';
                        break;
                    case 'files':
                        title = 'ПБ > Файлы';
                        break;
                    case 'info':
                        title = 'ПБ > ' + OrganizationBlock.getCurrentOrganization().getName();
                        break;
                    case 'profile':
                        title = 'ПБ > ' + Authorization.getCurrentUser().getName();
                        break;
                    default:
                        title = 'Простой Бизнес';
                        break;
                }
                document.title = title;
            }, 1);
        },
        /**
         * инициализация хранилища
         */
        initStorage: function () {
            let data = Dataset.getCustomStorage('url');
            if (data) {
                storage = data;
            }
        },
        /**
         * сохраним хранилище
         */
        saveStorage: function () {
            Dataset.setCustomStorage('url', storage);
        },
        /**
         * смена хеша
         * @param url
         */
        goToUrl: function (url) {
            window.location.hash = '#' + url;
        },
        /**
         * смена параметров
         * @param params
         */
        changeParams: function (params) {
            if ($.type(params) == 'array') {
                if (params.length > 0) {
                    window.location.hash = '#' + last_page + '::' + params.join('::');
                } else {
                    window.location.hash = '#' + last_page;
                }
            }
        },
        /**
         * получим текущую страницу
         * @returns {string}
         */
        getPage: function () {
            return last_page;
        },
        /**
         * получим текущие параметры
         * @returns {Array}
         */
        getParams: function () {
            return last_param;
        },
        /**
         * калбек при удалении задачи
         * @param project_id
         * @param task_id
         */
        deleteTask: function (project_id, task_id) {
            /** to refresh */
            let router_params = this.getParams();
            let router_page = this.getPage();
            if (router_page == 'projects') {
                if (router_params[0] && router_params[0] == project_id) {
                    Scene.getSceneObject().reloadTaskList();
                }
            }
        },
        /**
         * калбек при добавлении задачи
         * @param project_id
         * @param task_id
         */
        addTask: function (project_id, task_id) {
            /** to refresh */
            let router_params = this.getParams();
            let router_page = this.getPage();
            if (router_page == 'projects') {
                if (router_params[0] && router_params[0] == project_id) {
                    Scene.getSceneObject().reloadTaskList();
                    if (router_params[1] && router_params[1] == task_id) {
                        Scene.getSceneObject().checkCommentsUpdate();
                    }
                }
            }
        },
        openLink: function (link) {
            let self = this;
            let matches = [];
            switch (true) {
                case /^prostoy:\/\/comment\/([0-9]+)$/.test(link):
                    // comment
                    Interface.Load.show('Переход к комментарию');
                    matches = /^prostoy:\/\/comment\/([0-9]+)$/.exec(link);
                    Request.getCommentById(matches[1], function (comm_data) {
                        let comment = new Comment(comm_data.object().comment);
                        let task = comment.getParentTask();
                        let project = task.getParentProject();
                        let org = project.getParentOrganization();
                        OrganizationBlock.changOrgTitle(org.getId());
                        self.goToUrl('projects::' + project.getId() + '::' + task.getId() + '::' + comment.getId());
                        Interface.Load.hide();
                    });
                    break;
                case /^prostoy:\/\/task\/([0-9]+)$/.test(link):
                    // task
                    break;
                case /^prostoy:\/\/table\/([0-9]+)(\/record\/([0-9]+))?$/.test(link):
                    // table record
                    break;
                case /^prostoy:\/\/table\/([0-9]+)(\/comment\/([0-9]+))?$/.test(link):
                    // table comment
                    break;
                default:
                    break;
            }
        }
    };
})();