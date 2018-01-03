Forms.CommentMove = function (comment) {
    let local = {
        comment: comment || null,
        window: null,
        template: null,
        tree: {
            task: null,
            table: null
        }
    };
    let self = {
        /**
         * построим
         */
        build: function () {
            let lang = Lang.get()['forms']['comment_move'];
            local.window = new Windows({
                id: 'comment_move_' + comment.getId(),
                title: lang['title'],
                sizes: {
                    height: '70%',
                    width: '50%'
                },
                buttons: {
                    copy: {
                        title: lang['copy'],
                        checkbox: true,
                        additional_class: '--empty --left'
                    },
                    save: {
                        title: lang['move'],
                        callback: function (win) {
                            win.loading(true);
                            self.send(function (result) {
                                win.loading();
                                if (result == true) {
                                    win.hide();
                                } else {
                                    Notice.error(lang['error_' + result]);
                                }
                            });
                        },
                        additional_class: '--full --right'
                    },
                    cancel: {
                        title: lang['cancel'],
                        callback: function (win) {
                            win.hide();
                        },
                        additional_class: '--empty --right'
                    }
                },
                content: function () {
                    let form = local.template = $('<div class="form --comment-move">');
                    /** set tabs */
                    let tabs = new Tabs({
                        tab_id: 'comment_move_' + local.comment.getId(),
                        items: {
                            task: {
                                title: lang['task'],
                                content: function (block) {
                                    self.renderTask(block);
                                }
                            },
                            // table: {
                            //     title: lang['forms']['comment_move']['table'],
                            //     content: function (block) {
                            //         self.renderTable(block);
                            //     }
                            // }
                        },
                    });
                    form.append(tabs.html());
                    tabs.setContent('task');
                    return form;
                },
                no_scroll: false
            }).show();
        },
        /**
         * прорисовка блока задачи
         * @param parent
         */
        renderTask: function (parent) {
            let tree = local.tree.task = Tree.allTasks();
            tree.appendTo(parent);
        },
        // /**
        //  * прорисовка блока таблицы
        //  * @param parent
        //  */
        // renderTable: function (parent) {
        //
        // },
        /**
         * получим контент
         * @returns {null}
         */
        html: function () {
            return local.template;
        },
        /**
         * отправим на сервер
         * @param callback
         */
        send: function (callback) {
            let id = local.tree.task.data('getSelected')()[0];
            if (/task_/gi.test(id)) {
                let task_id = id.replace('task_', '');
                if (task_id != local.comment.getParentTask().getId()) {
                    local.comment.changeTask(task_id, $('#checkbox__copy', local.window).prop('checked'), callback);
                } else {
                    callback('equal');
                }
            } else {
                callback('not');
            }
        },
        /**
         * перезагрузим
         */
        reload: function () {

        }
    };
    self.build();
    return self;
};