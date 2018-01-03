/**
 *
 * @type {{buildTree, set, setTreeProjectAsFull, getOrganizationIds, getProjectIds, getUserIds, getCategoryIds, getGroupIds, getTaskIds, getTaskSyncIds, loadAllProjectTasks, deleteProject, deleteTask, clearOrganizationGroups, deleteCategory, getUserByLogin, getAllUsers, getFullTask, getFullUser, setFullUser, setFullTask}}
 */
Dataset.Tree = (function () {
    /** piblic */
    /** TODO
     * упростить setTree
     * **/
    return {
        /**
         * строим дерево из данных
         * @param xml
         */
        buildTree: function (xml) {
            let self = this;
            if ($('news', xml).length > 0) {
                let entities = Object.keys(self.set);
                for (let i = 0; i < entities.length; i++) {
                    $(entities[i] + 's > ' + entities[i], xml).each(function (g, entity) {
                        self.set[entities[i]](Tool.xmlToJson(entity), true);
                    });
                }
            }
        },
        set: {
            /**
             * организация в дереве
             * @param org
             * @returns {boolean}
             */
            organization: function (org) {
                let tree = Dataset.storage.data.tree;
                if (typeof tree[org.id] == 'undefined') {
                    tree[org.id] = {
                        c: {},
                        p: {},
                        g: {},
                        u: {}
                    };
                }
                // постоянно парсим группы
                if (org.groups) {
                    let groups = [];
                    if ($.type(org.groups.group) == 'object') {
                        groups = [org.groups.group];
                    } else {
                        groups = org.groups.group;
                    }
                    for (let i = 0; i < groups.length; i++) {
                        if (typeof groups[i]['_id'] != 'undefined' && groups[i]['_id'] != '') {
                            tree[org.id].g[groups[i]['_id']] = 1;
                        }
                    }
                }
                // постоянно парсим юзеров
                if (org.clients) {
                    let users = ($.type(org.clients.user) == 'object') ? [org.clients.user] : org.clients.user;
                    for (let i = 0; i < users.length; i++) {
                        if (typeof users[i]['_id'] != 'undefined' && users[i]['_id'] != '') {
                            tree[org.id].u[users[i]['_id']] = 0;
                        }
                    }
                    let admins = ($.type(org.admins.user) == 'object') ? [org.admins.user] : org.admins.user;
                    for (let i = 0; i < admins.length; i++) {
                        if (typeof admins[i]['_id'] != 'undefined' && admins[i]['_id'] != '') {
                            tree[org.id].u[admins[i]['_id']] = 0;
                        }
                    }
                }
                return true;
            },
            /**
             *
             * проекты в дерево
             * @param {object} project данные проекта
             * @param {object} news
             * @param {boolean} full полная ли загрузка
             * @returns {boolean}
             */
            project: function (project, news, full) {
                let tree = Dataset.storage.data.tree;
                let org = project.owner_org || 'other';
                if (typeof tree[org] == 'undefined') {
                    org = 'other';
                }
                if (typeof tree[org].p[project['id']] == 'undefined') {
                    tree[org].p[project['id']] = {
                        t: {},
                        f: (full ? 1 : 0)
                    };
                } else {
                    tree[org].p[project['id']]['f'] = (full ? 1 : 0);
                }
                return true;
            },
            /**
             * категория в дерево
             * @param {object} cat данные категории
             * @returns {Boolean}
             */
            category: function (cat) {
                let tree = Dataset.storage.data.tree;
                if (cat.owner_type == 'base') {
                    for (let id in tree) {
                        if (tree.hasOwnProperty(id)) {
                            tree[id].c[cat.id] = 0;
                        }
                    }
                } else if (cat.owner_type == 'org') {
                    let id = cat.owner_id || 'other';
                    if (typeof tree[id] == 'undefined') {
                        id = 'other';
                    }
                    tree[id].c[cat.id] = (id == 'other') ? 0 : 1;
                }
                return true;
            },
            /**
             *
             * задачи в дерево
             * @param {object} task данные задачи
             * @param news
             * @param {boolean} full полная ли задача
             * @returns {boolean}
             */
            task: function (task, news, full) {
                let tree = Dataset.storage.data.tree;
                let org_id = task.org_id || 'other';
                let project_id = task.projectid;
                let task_id = task.id;
                if (typeof tree[org_id] == 'undefined') {
                    org_id = 'other';
                }
                if (typeof tree[org_id].p[project_id] == 'undefined') {
                    org_id = 'other';
                    if (typeof tree[org_id].p[project_id] == 'undefined') {
                        return false;
                    } else {
                        tree[org_id].p[project_id].t[task_id] = (full) ? 1 : 0;
                    }
                } else {
                    tree[org_id].p[project_id].t[task_id] = (full) ? 1 : 0;
                }
                if (news) {
                    Router.addTask(project_id, task_id);
                }
                return true;
            }
        },
        /**
         * задаем, что проект в дереве полон
         * @param {string} org_id id организации
         * @param {string} proj_id id проекта
         * @param {boolean} full полон или нет
         */
        setTreeProjectAsFull: function (org_id, proj_id, full) {
            let tree = Dataset.storage.data.tree;
            if (typeof tree[org_id] != 'undefined') {
                tree[org_id].p[proj_id]['f'] = (full ? 1 : 0);
            } else {
                tree['other'].p[proj_id]['f'] = (full ? 1 : 0);
            }
        },
        /**
         * ид организаций
         * @returns {Array}
         */
        getOrganizationIds: function () {
            let tree = Dataset.storage.data.tree;
            return Object.keys(tree);
        },
        /**
         * ид проектов
         * @param org_id
         * @returns {Array}
         */
        getProjectIds: function (org_id) {
            let tree = Dataset.storage.data.tree;
            return Object.keys(tree[org_id].p);
        },
        /**
         * ид пользователей
         * @param org_id
         * @returns {Array}
         */
        getUserIds: function (org_id) {
            let tree = Dataset.storage.data.tree;
            return Object.keys(tree[org_id].u);
        },
        /**
         * ид категорий
         * @param org_id
         * @returns {Array}
         */
        getCategoryIds: function (org_id) {
            let tree = Dataset.storage.data.tree;
            return Object.keys(tree[org_id].c);
        },
        /**
         * ид групп
         * @param org_id
         * @returns {Array}
         */
        getGroupIds: function (org_id) {
            let tree = Dataset.storage.data.tree;
            return Object.keys(tree[org_id].g);
        },
        /**
         * ид задач
         * @param org_id
         * @param project_id
         * @param callback
         * @returns {*}
         */
        getTaskIds: function (org_id, project_id, callback) {
            let tree = Dataset.storage.data.tree;
            if (typeof tree[org_id] == 'undefined') {
                org_id = 'other';
            }
            if (typeof tree[org_id].p[project_id] == 'undefined') {
                return [];
            }
            if (tree[org_id].p[project_id].f == 0) {
                this.loadAllProjectTasks(org_id, project_id, function () {
                    return callback(Object.keys(tree[org_id].p[project_id].t));
                });
            } else {
                return callback(Object.keys(tree[org_id].p[project_id].t));
            }
        },
        /**
         * ид задач синхронно
         * @param org_id
         * @param project_id
         * @returns {*}
         */
        getTaskSyncIds: function (org_id, project_id) {
            let tree = Dataset.storage.data.tree;
            if (typeof tree[org_id] == 'undefined') {
                org_id = 'other';
            }
            if (typeof tree[org_id].p[project_id] == 'undefined') {
                return [];
            }
            return Object.keys(tree[org_id].p[project_id].t);
        },
        /**
         * загрузим все задачи проекта
         * @param org_id
         * @param project_id
         * @param callback
         */
        loadAllProjectTasks: function (org_id, project_id, callback) {
            let self = this;
            Request.loadProjectTasks(project_id, {load_contact: true, load_closed: true}, function (req) {
                let xml = req.xml();
                $('tasks > task', xml).each(function (i, task) {
                    new Task().set(task);
                    // set to tree
                    self.set.task(Tool.xmlToJson(task), false, false);
                });
                self.setTreeProjectAsFull(org_id, project_id, true);
                // save all
                Dataset.save();
                callback();
            });
        },
        /**
         * удалим проект
         * @param org_id
         * @param project_id
         * @returns {boolean}
         */
        deleteProject: function (org_id, project_id) {
            let tree = Dataset.storage.data.tree;
            if (typeof tree[org_id] != 'undefined' && typeof tree[org_id].p[project_id] != 'undefined') {
                delete tree[org_id].p[project_id];
                return true;
            }
            return false;
        },
        /**
         * удалим задачу
         * @param org_id
         * @param project_id
         * @param task_id
         * @returns {boolean}
         */
        deleteTask: function (org_id, project_id, task_id) {
            let tree = Dataset.storage.data.tree;
            if (typeof tree[org_id] != 'undefined' && typeof tree[org_id].p[project_id] != 'undefined' && typeof tree[org_id].p[project_id].t[task_id] != 'undefined') {
                delete tree[org_id].p[project_id].t[task_id];
                Router.deleteTask(project_id, task_id);
                return true;
            }
            return false;
        },
        /**
         * очистим группы организации
         * @param org_id
         * @returns {boolean}
         */
        clearOrganizationGroups: function (org_id) {
            let tree = Dataset.storage.data.tree;
            if (typeof tree[org_id] != 'undefined') {
                for (let id in tree[org_id].g) {
                    if (tree[org_id].g.hasOwnProperty(id)) {
                        Dataset.get('group', id).remove();
                    }
                }
                tree[org_id].g = {};
                return true;
            }
            return false;
        },
        /**
         * удалим категорию
         * @param org_id
         * @param category_id
         * @returns {boolean}
         */
        deleteCategory: function (org_id, category_id) {
            let tree = Dataset.storage.data.tree;
            if (typeof tree[org_id] != 'undefined' && typeof tree[org_id].c[category_id] != 'undefined') {
                delete tree[org_id].c[category_id];
                return true;
            }
            return false;
        },
        /**
         * получим юзера по логину
         * @param login
         * @returns {*}
         */
        getUserByLogin: function (login) {
            let data = Dataset.storage.data.logins;
            try {
                let id = data[login.encode()];
                if (typeof id == 'undefined') {
                    let request = Request.getUserByLogin(login);
                    let user = new User().set($('user', request));
                    id = user.getId();
                }
                return Dataset.get('user', id);
            } catch (e) {
                return false;
            }
        },
        /**
         * получим всех юзеров
         * @returns {Array}
         */
        getAllUsers: function () {
            let users = [];
            console.log(Dataset.storage.data.entities.users);
            for (let id in Dataset.storage.data.entities.users) {
                if (id != '' && Dataset.storage.data.entities.users.hasOwnProperty(id)) {
                    console.log(id);
                    users.push(Dataset.get('user', id));
                }
            }
            return users;
        },
        getFullTask: function (task) {
            let self = this;
            let task_id = task.getId();
            let project = task.getParentProject();
            let project_id = project.getId();
            let organization = project.getParentOrganization();
            let organization_id = organization.getId();
            try {
                let index = Dataset.storage.data.tree[organization_id].p[project_id].t[task_id];
                if (index == 0) {
                    Dataset.getEntityFromServer('task', task_id, function (type, id, data) {
                        let xml = data.xml();
                        let new_task = Dataset.get('task',);
                        if ($(xml).attr('status') == 'OK') {
                            $('task', xml).each(function (i, item) {
                                new_task.set(item);
                            });
                            return self.setFullTask(new_task);
                        } else {
                            return false;
                        }
                    });
                } else {
                    return true;
                }
            } catch (e) {
                return false;
            }
        },
        getFullUser: function (user) {
            let self = this;
            let user_id = user.getId();
            let organizations = user.getUserOrganization();
            let organization_ids = [];
            let index = 1;
            for (let i = 0; i < organizations.length; i++) {
                let organization_id = organizations[i].getId();
                organization_ids.push(organization_id);
                if (Dataset.storage.data.tree[organization_id].u[user_id] == 0) {
                    index = 0;
                }
            }
            try {
                if (index == 0) {
                    Dataset.getEntityFromServer('user', user_id, function (type, id, data) {
                        let xml = data.xml();
                        let new_user = Dataset.get('user',);
                        if ($(xml).attr('status') == 'OK') {
                            $('user', xml).each(function (i, item) {
                                new_user.set(item);
                            });
                            user = new_user;
                            return self.setFullUser(user);
                        } else {
                            return false;
                        }
                    });
                } else {
                    return true;
                }
            } catch (e) {
                return false;
            }
        },
        setFullUser: function (user) {
            try {
                let user_id = user.getId();
                let organizations = user.getUserOrganization();
                for (let i = 0; i < organizations.length; i++) {
                    Dataset.storage.data.tree[organizations[i].getId()].u[user_id] = 1;
                }
                Dataset.save();
                return user;
            } catch (e) {
                return false;
            }
        },
        setFullTask: function (task) {
            try {
                let task_id = task.getId();
                let project = task.getParentProject();
                let project_id = project.getId();
                let organization = project.getParentOrganization();
                let organization_id = organization.getId();
                Dataset.storage.data.tree[organization_id].p[project_id].t[task_id] = 1;
                Dataset.save();
                return task;
            } catch (e) {
                return false;
            }
        }
    };
})();