var Tree = (function () {
    /** private */
    let local = {};
    /** functions */
    let self = {
        buildSearchTree: function (data) {
            let wrap = $('<div class="simple-tree-wrap"></div>');
            let container = $('<div class="simple-tree"></div>');
            container.jstree({
                'plugins': ['search'],
                'core': {
                    'multiple': false,
                    'data': data,
                    'themes': {
                        'name': 'proton',
                        'responsive': true
                    }
                },
                'search': {
                    'show_only_matches': true,
                    'show_only_matches_children': true
                }
            });
            let timeout = false;
            let search = Elements.searchInput('tree_search', function (val, input) {
                if (timeout) {
                    window.clearTimeout(timeout);
                }
                timeout = window.setTimeout(function () {
                    if (val == '') {
                        container.jstree(true).clear_search();
                    } else {
                        container.jstree(true).search(val);
                    }
                }, 250);
            }).appendTo(wrap);
            container.data('getSelected', function () {
                return container.jstree('get_selected');
            }).appendTo(wrap);
            return wrap;
        },
        buildTree: function (data) {
            let container = $('<div class="simple-tree"></div>');
            container.jstree({
                'core': {
                    'multiple': false,
                    'data': data,
                    'themes': {
                        'name': 'proton',
                        'responsive': true
                    }
                }
            });
            return container.data('getSelected', function () {
                return container.jstree('get_selected');
            });
        },
        buildCheckboxTree: function (data, checkbox) {
            let container = $('<div class="simple-tree"></div>');
            container.jstree({
                'plugins': ((checkbox) ? ['checkbox'] : []),
                'core': {
                    'data': data,
                    'themes': {
                        'name': 'proton',
                        'responsive': true
                    }
                }
            });
            return container.data('getSelected', function () {
                return container.jstree('get_selected');
            });
        },
        allTasks: function () {
            let data = [];
            let list_organizations = new List.Organizations('user');
            list_organizations.sort('title');
            let organizations = list_organizations.list();
            for (let i = 0; i < organizations.length; i++) {
                let org = organizations[i];
                data.push({
                    'text': org.getName(),
                    'id': 'organization_' + org.getId(),
                    'data': {},
                    'icon': 'icon-Организация2',
                    'children': function () {
                        let children = [];
                        let projects_list = new List.Projects(org.getId());
                        projects_list.sortByName();
                        let projects = projects_list.list();
                        for (let j = 0; j < projects.length; j++) {
                            let project = projects[j];
                            children.push({
                                'text': project.getName(),
                                'id': 'project_' + project.getId(),
                                'icon': 'icon-Проект',
                                'data': {},
                                'children': function () {
                                    let children = [];
                                    let tasks_list = new List.Tasks(project.getId(), true);
                                    tasks_list.load();
                                    tasks_list.sortByName();
                                    let tasks = tasks_list.list();
                                    for (let j = 0; j < tasks.length; j++) {
                                        let task = tasks[j];
                                        children.push({
                                            'text': task.getName(),
                                            'id': 'task_' + task.getId(),
                                            'icon': 'icon-Задача',
                                            'data': {
                                                'vcTo': task.getAuthorName()
                                            }
                                        })
                                    }
                                    return children;
                                }()
                            })
                        }
                        return children;
                    }()
                });
            }
            return self.buildSearchTree(data);
        },
        allUsers: function (checkbox, no_fired) {
            let data = [];
            let list_organizations = new List.Organizations('user');
            list_organizations.sort('title');
            let organizations = list_organizations.list();
            for (let i = 0; i < organizations.length; i++) {
                let org = organizations[i];
                data.push({
                    'text': org.getName(),
                    'id': 'organization_' + org.getId(),
                    'data': {},
                    'icon': 'icon-Организация2',
                    'children': function () {
                        let children = [];
                        let groups_list = new List.UserGrops(org.getId());
                        groups_list.sortByName();
                        let groups = groups_list.list();
                        for (let j = 0; j < groups.length; j++) {
                            let group = groups[j];
                            if (no_fired && org.groupIsFired(group)) {
                                continue;
                            }
                            children.push({
                                'text': group.getName(),
                                'id': 'group_' + group.getId(),
                                'icon': 'icon-Пользователи',
                                'data': {},
                                'children': function () {
                                    let children = [];
                                    let users_list = new List.Users(group.getId());
                                    users_list.sortByName();
                                    let users = users_list.list();
                                    for (let j = 0; j < users.length; j++) {
                                        let user = users[j];
                                        children.push({
                                            'text': user.getName(),
                                            'id': 'user_' + user.getId(),
                                            'icon': 'icon-Обычный-пользователь',
                                            'data': {}
                                        })
                                    }
                                    return children;
                                }()
                            })
                        }
                        return children;
                    }()
                });
            }
            return self.buildCheckboxTree(data, checkbox);
        },
        allContacts: function (checkbox, email) {
            let data = [];
            let list_organizations = new List.Organizations('user');
            list_organizations.sort('title');
            let organizations = list_organizations.list();
            for (let i = 0; i < organizations.length; i++) {
                let org = organizations[i];
                data.push({
                    'text': org.getName(),
                    'id': 'organization_' + org.getId(),
                    'data': {},
                    'icon': 'icon-Организация2',
                    'children': function () {
                        let children = [];
                        let groups_list = new List.ContactGroups(org.getId());
                        groups_list.sortByName();
                        let groups = groups_list.list();
                        for (let j = 0; j < groups.length; j++) {
                            let group = groups[j];
                            children.push({
                                'text': group.getName(),
                                'id': 'group_' + group.getId(),
                                'icon': 'icon-Контакты-для-смс',
                                'data': {},
                                'children': function () {
                                    let children = [];
                                    let contacts_list = new List.Tasks(group.getId(), true);
                                    contacts_list.load();
                                    contacts_list.sortByName();
                                    let contacts = contacts_list.list();
                                    for (let j = 0; j < contacts.length; j++) {
                                        let contact = contacts[j];
                                        let name = contact.getName();
                                        let id = contact.getId();
                                        if (email) {
                                            let mail = contact.contactHasEmail();
                                            if (mail == false) {
                                                continue;
                                            }
                                            let mail_array = mail.split(';');
                                            for (let p = 0; p < mail_array.length; p++) {
                                                id = mail_array[p];
                                                let full_name = name;
                                                if (id != full_name) {
                                                    full_name += ' (' + id + ')';
                                                }
                                                children.push({
                                                    'text': full_name,
                                                    'id': 'contact_' + id,
                                                    'icon': 'icon-Контакты',
                                                    'data': {}
                                                });
                                            }
                                        } else {
                                            children.push({
                                                'text': name,
                                                'id': 'contact_' + id,
                                                'icon': 'icon-Контакты',
                                                'data': {}
                                            });
                                        }
                                    }
                                    return children;
                                }()
                            })
                        }
                        return children;
                    }()
                });
            }
            return self.buildCheckboxTree(data, checkbox);
        }
    };
    /** public */
    return self;
})();