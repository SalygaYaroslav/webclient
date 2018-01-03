/**
 * сцена проектов
 * @type {Function}
 */
Scene.projects = (function (template) {
    let local = {
        template: template,
        scene: null,
        projects_list: null,
        tasks_list: null,
        comments_list: null,
        // project array
        project_array: [],
        task_array: [],
        selected_project_id: null,
        selected_task_id: null,
        comment: {
            template: null,
            list: null,
            form: null,
            block: null,
            find: {
                category: 0,
                text: '',
                timeout: null
            },
            to_load: null,
            index: 0
        }
    };
    return {
        /**
         * инициализация
         */
        init: function () {
            this.render();
            this.changeParams(Router.getParams());
        },
        /**
         * прорисовка
         */
        render: function () {
            local.template.empty().append(Template.render('scene', 'projects/scene'));
            local.scene = $('.projects-scene', local.template);
            local.projects_list = $('.projects-list', local.template);
            local.tasks_list = $('.tasks-list', local.template);
            local.comments_list = $('.comments-list', local.template);
            this.addListener();
        },
        /**
         * рисуем проекты
         */
        drawProjects: function () {
            // очистим блок
            local.projects_list.empty();
            let org = OrganizationBlock.getCurrentOrganization();
            let projects_list = new List.Projects(org.getId());
            projects_list.sortByName();
            let projects = projects_list.list();
            // удалим элемнт данных о том, что мы смотрим другой уровень
            local.scene.removeClass('task-lvl').removeClass('comment-lvl');
            for (let i = 0; i < projects.length; i++) {
                let project = projects[i];
                $(Template.render('scene', 'projects/squire', {
                    name: project.getName(),
                    id: project.getId()
                })).appendTo(local.projects_list);
            }
        },
        /**
         * рисуем задачи
         * @param project_id
         * @param callback
         */
        drawTasks: function (project_id, callback) {
            // очистим список старых задач
            local.task_array = [];
            // очистим блок
            local.tasks_list.empty();
            // удалим элемнт данных о том, что мы смотрим другой уровень
            local.scene.removeClass('comment-lvl');
            local.scene.addClass('task-lvl');
            new List.Tasks(project_id).load(function (tasks_list) {
                tasks_list.sortByName();
                local.task_array = tasks_list.list();
                for (let i = 0; i < local.task_array.length; i++) {
                    let task = local.task_array[i];
                    $(Template.render('scene', 'projects/task_squire', {
                        name: task.getName(),
                        id: task.getId()
                    })).appendTo(local.tasks_list);
                }
                if (typeof callback == 'function') {
                    callback(tasks_list);
                }
            });
        },
        /**
         * добавим калбеки
         */
        addListener: function () {
            local.projects_list.undelegate('.project-squire', 'click').delegate('.project-squire', 'click', function () {
                Router.changeParams([$(this).attr('id')]);
            });
            local.tasks_list.undelegate('.task-squire', 'click').delegate('.task-squire', 'click', function () {
                Router.changeParams([local.selected_project_id, $(this).attr('id')]);
            });
            local.comments_list.undelegate().delegate();
        },
        /**
         * выбор проекта
         * @param id
         * @param callback
         */
        selectProject: function (id, callback) {
            if (local.projects_list.is(':empty')) {
                this.drawProjects();
            }
            this.unSelectTask(local.selected_task_id);
            this.drawProjectTabs(id);
            if (id != local.selected_project_id) {
                $('.project-squire.selected', local.projects_list).removeClass('selected').switchClass('to-right', 'to-bottom');
                local.selected_project_id = id;
                local.selected_task_id = null;
                local.projects_list.find('#' + id).eq(0).addClass('selected').switchClass('to-bottom', 'to-right');
                this.drawTasks(local.selected_project_id, callback);
            } else {
                if (typeof callback == 'function') {
                    callback();
                }
            }
        },
        /**
         * выбор задачи
         * @param id
         * @param callback
         */
        selectTask: function (id, callback) {
            if (id != local.selected_task_id) {
                this.unSelectTask(local.selected_task_id);
                local.selected_task_id = id;
                local.tasks_list.find('#' + id).eq(0).addClass('selected').addClass('to-right');
                if (typeof callback == 'string') {
                    local.comment.to_load = callback;
                }
                this.drawTaskTabs(local.selected_task_id);
            } else {
                if (typeof callback == 'function') {
                    callback();
                }
            }
        },
        /**
         * снятие выбранной задачи
         * @param task_id
         */
        unSelectTask: function (task_id) {
            $('.task-squire#' + task_id, local.tasks_list).removeClass('selected').removeClass('to-right');
            local.selected_task_id = null;
            local.comment = {
                template: null,
                list: null,
                form: null,
                block: null,
                find: {
                    category: 0,
                    text: '',
                    timeout: null
                }
            };
        },
        /**
         * рисуем табулятор проекта
         * @param project_id
         */
        drawProjectTabs: function (project_id) {
            local.comments_list.empty().show();
            let lang = Lang.get();
            let tabs = new Tabs({
                tab_id: 'project_info_' + project_id,
                items: {
                    info: {
                        title: lang['scene']['tab']['info'],
                        content: ''
                    },
                    files: {
                        title: lang['scene']['tab']['files'],
                        content: ''
                    },
                    comments: {
                        title: lang['scene']['tab']['comments'],
                        content: ''
                    }
                }
            });
            local.comments_list.append(tabs.html());
        },
        /**
         * рисуем табулятор задачи
         * @param task_id
         */
        drawTaskTabs: function (task_id) {
            let self = this;
            local.comments_list.empty().show();
            let lang = Lang.get();
            let tabs = new Tabs({
                tab_id: 'task_info_' + task_id,
                full: true,
                items: {
                    comments: {
                        title: lang['scene']['tab']['task'],
                        content: function (block) {
                            self.drawComments(block, task_id);
                        }
                    },
                    info: {
                        title: lang['scene']['tab']['info'],
                        content: function (block) {
                            let task = Dataset.get('task',local.selected_task_id);
                            let editable = task.isEditable();
                            let tree_form = TreeForm.getTreeForm('task', function (config) {
                                return task.getDataToForm(config);
                            }, editable);
                            $('<div class="form-info full-wh ' + ((editable) ? 'editable' : '') + '"></div>').append(tree_form.render()).appendTo(block);
                            let button_save = new Elements.button('task_form_save', 'save', 'task_form --full --right');
                            let button_cancel = new Elements.button('task_form_save', 'cancel', 'task_form --empty --right');
                            if (editable) {
                                $('<div class="form-button"></div>').append(button_save).append(button_cancel).appendTo(block);
                            }
                            button_save.on('click', function () {
                                Interface.Load.show('Обработка данных', block);
                                tree_form.getFormData(function (data) {
                                    task.saveEntityToServer(data, function () {
                                        Interface.Load.hide();
                                        $('.form-info', block).empty();
                                        tree_form = TreeForm.getTreeForm('user', task.getDataToForm, editable);
                                        $('.form-info', block).append(tree_form.render());
                                        Notice.notify('Данные изменены');
                                    });
                                });
                            });
                        }
                    },
                    favorite: {
                        title: lang['scene']['tab']['favorite'],
                        content: ''
                    },
                    files: {
                        title: lang['scene']['tab']['files'],
                        content: ''
                    }
                },
                resize: function (full) {
                    switch (full) {
                        case true:
                            local.comments_list.css('left', '0');
                            break;
                        case false:
                            local.comments_list.css('left', '50%');
                            break;
                    }
                }
            });
            local.comments_list.append(tabs.html());
        },
        /**
         * рисуем комменты
         * @param block
         * @param task_id
         */
        drawComments: function (block, task_id) {
            let self = this;
            let task = Dataset.get('task',task_id);
            let template = local.comment.template = $(Template.render('scene', 'projects/list_comments', {
                name: task.getName(),
                author: task.getAuthorName() || '[Без назначения]'
            }));
            /** search */
            let search_block = $('.search', template);
            Elements.searchInput('comment-search', function (val) {
                if (val.length > 2 || val == '') {
                    local.comment.find.text = val;
                    if (local.comment.find.timeout != null) {
                        window.clearTimeout(local.comment.find.timeout);
                    }
                    local.comment.find.timeout = setTimeout(function () {
                        self.find();
                    }, 1000);
                }
            }).appendTo(search_block);
            /** categories */
            new List.Categories(OrganizationBlock.getCurrentOrganization().getId()).convertToSelect(true, false, function (value) {
                local.comment.find.category = value;
                self.find();
            }).appendTo($('.category', template));
            block.append(template);
            let list_block = local.comment.block = $('.bottom', template);
            let loading = $('.loading', template);
            let form = local.comment.form = new Forms.Comment(task);
            let form_block = $('.list-form', template);
            form_block.append(form.html());
            if (task_id == '88242') {
                template.addClass('hide-form');
            }
            /** list */
            let list = local.comment.list = new List.Comments(task_id);
            let load = function (block) {
                list.load(function () {
                    loading.show();
                }, function (comments) {
                    let array = [];
                    for (let i = 0; i < comments.length; i++) {
                        let comment = comments[i];
                        comment.setCallbacks({
                            quote: function (quote) {
                                template.addClass('--form');
                                form.appendQuote(quote);
                            },
                            resend: function (comment) {
                                template.addClass('--form');
                                form.setReplyComment(comment);
                            }
                        });
                        array.push(comment.getId());
                        comment.drawSimple().appendTo(block);
                        loading.hide();
                    }
                    if (local.comment.to_load) {
                        if (array.indexOf(local.comment.to_load) == '-1') {
                            load(block);
                        } else {
                            let el = $('.comment#' + local.comment.to_load, list_block);
                            list_block.scrollTo(el);
                            el.trigger('click');
                            local.comment.to_load = null;
                        }
                    }
                });
            };
            load(list_block);
            $('.list-wrap', local.comment.template).undelegate('.comment', 'click').delegate('.comment', 'click', function () {
                $(this).parents('.--delegate').eq(0).find('.active').removeClass('active');
                $(this).addClass('active');
            });
            list_block.off('scroll').on('scroll', function (event) {
                let element = event.target;
                if (parseInt(element.scrollHeight - element.scrollTop - 20) <= element.clientHeight) {
                    load(list_block);
                }
            });
            form_block.undelegate('.title-form', 'click').delegate('.title-form', 'click', function () {
                template.addClass('--form');
            });
            form.setCancelCallback(function () {
                template.removeClass('--form');
            });
            // update
            $(document).off('webclient.comments.update.' + local.selected_task_id).on('webclient.comments.update.' + local.selected_task_id, function () {
                local.comment.list.needUpdate(function (comments) {
                    for (let i = 0; i < comments.length; i++) {
                        comments[i].setCallbacks({
                            quote: function (quote) {
                                local.comment.template.addClass('--form');
                                local.comment.form.appendQuote(quote);
                            },
                            resend: function (comment) {
                                local.comment.template.addClass('--form');
                                local.comment.form.setReplyComment(comment);
                            }
                        });
                        let block = comments[i].drawSimple();
                        let id = comments[i].getId();
                        let fnd = local.comment.block.find('#' + id);
                        if (fnd.length > 0) {
                            fnd.eq(0).hide();
                            fnd.after(block.addClass(fnd.eq(0).hasClass('active') ? 'active' : ''));
                            fnd.eq(0).remove();
                        } else {
                            block.prependTo(local.comment.block);
                        }
                    }
                });
            });
            $(document).off('webclient.comments.vote').on('webclient.comments.vote', function (event, vote) {
                let comment = local.comment.list.addLike(vote);
                let id = comment.getId();
                let fnd = local.comment.block.find('#' + id);
                if (fnd.length > 0) {
                    comment.setCallbacks({
                        quote: function (quote) {
                            local.comment.template.addClass('--form');
                            local.comment.form.appendQuote(quote);
                        },
                        resend: function (comment) {
                            local.comment.template.addClass('--form');
                            local.comment.form.setReplyComment(comment);
                        }
                    });
                    let block = comment.drawSimple();
                    fnd.eq(0).hide();
                    fnd.after(block.addClass(fnd.eq(0).hasClass('active') ? 'active' : ''));
                    fnd.eq(0).remove();
                }
            });
        },
        swithTaskAuthor: function (name) {
            $('.author', local.comment.template).attr('title', name);
            $('.author_name', local.comment.template).html(name);
        },
        appendComment: function (comment) {
            let com = local.comment.list.appendComment(comment);
            com.setCallbacks({
                quote: function (quote) {
                    local.comment.template.addClass('--form');
                    local.comment.form.appendQuote(quote);
                },
                resend: function (comment) {
                    local.comment.template.addClass('--form');
                    local.comment.form.setReplyComment(comment);
                }
            });
            let block = com.drawSimple();
            let id = com.getId();
            let fnd = local.comment.block.find('#' + id);
            if (fnd.length > 0) {
                fnd.eq(0).hide();
                fnd.after(block.addClass(fnd.eq(0).hasClass('active') ? 'active' : ''));
                fnd.eq(0).remove();
                return block;
            } else {
                return block.prependTo(local.comment.block);
            }
        },
        scrollTo: function (comment) {
            switch (typeof comment) {
                case 'int':
                case 'string':
                    local.comment.block.scrollTo('.comment#' + comment);
                    break;
                case 'object':
                    local.comment.block.scrollTo(comment);
                    break;
            }
        },
        /**
         * перезагрузка
         */
        reload: function () {
            // обнулим
            local.selected_project_id = null;
            local.selected_task_id = null;
            // рисуем
            Router.changeParams([]);
            this.render();
            this.drawProjects();
        },
        /**
         * перерисовка списка задач
         */
        reloadTaskList: function () {
            let self = this;
            self.drawTasks(local.selected_project_id, function () {
                if (local.selected_task_id) {
                    let block = $('#' + local.selected_task_id, local.tasks_list);
                    if (block.length == 1) {
                        block.addClass('selected');
                    } else {
                        self.selectProject(local.selected_project_id);
                    }
                }
            });
        },
        /**
         * снятие калбеков
         * @param callback
         */
        unbindScene: function (callback) {
            $(document).off('webclient.comments.update.' + local.selected_task_id);
            $(document).off('webclient.comments.vote');
            callback();
        },
        /**
         * смена параметров
         * @param params
         */
        changeParams: function (params) {
            let self = this;
            if (typeof params != 'undefined') {
                switch (params.length) {
                    case 0:
                        self.reload();
                        break;
                    case 1:
                        self.selectProject(params[0]);
                        break;
                    case 2:
                        self.selectProject(params[0], function () {
                            self.selectTask(params[1]);
                        });
                        break;
                    case 3:
                        self.selectProject(params[0], function () {
                            self.selectTask(params[1], params[2]);
                        });
                        break;
                }
            }
        },
        checkCommentsUpdate: function () {
        },
        find: function () {
            if (local.comment.find.category == 0 && local.comment.find.text == '') {
                local.comment.template.removeClass('find');
            } else {
                $('.find-result', local.comment.template).empty();
                local.comment.template.addClass('find');
                let options = {};
                if (local.comment.find.category != '0') {
                    options.cat_id = local.comment.find.category;
                }
                if ($.trim(local.comment.find.text) != '') {
                    options.comment = $.trim(local.comment.find.text.encode());
                }
                if (Object.keys(options).length > 0) {
                    options.task_id = local.selected_task_id;
                    options.project_id = local.selected_project_id;
                    options.callback = function () {
                    };
                    let list = new List.CommentsFind(options);
                    list.load(function () {
                        $('.loading', local.comment.template).show();
                    }, function (comments) {
                        if (comments.length == 0) {
                            $('.find-result', local.comment.template).append('<div class="no-result"><div class="no-result-text">Поиск не дал результов</div></div>')
                        } else {
                            for (let i = 0; i < comments.length; i++) {
                                let comment = comments[i];
                                comment.setCallbacks({
                                    quote: function (quote) {
                                        local.comment.template.addClass('--form');
                                        local.comment.form.appendQuote(quote);
                                    },
                                    resend: function (comment) {
                                        local.comment.template.addClass('--form');
                                        local.comment.form.setReplyComment(comment);
                                    }
                                });
                                comment.drawSimple().appendTo($('.find-result', local.comment.template));
                            }
                        }
                        $('.loading', local.comment.template).hide();
                    });
                }
            }
        }
    }
});