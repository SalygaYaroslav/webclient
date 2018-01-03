Forms.SendMailParams = function (task) {
    let local = {
        task: task || null,
        task_params: null,
        window: null,
        template: null,
        default_gateway: {
            'send_from_gateway': '0',
            'show_prefix': true,
            'show_postfix': true,
            'override_theme': false,
            'theme_text': '',
            'individual': false,
            'save-original': false,
            'file-attach': true,
            'read-notify': false,
            'override-sender': false
        }
    };
    let self = {
        /**
         * построим
         */
        build: function () {
            let lang = Lang.get();
            local.window = new Windows({
                id: 'send_mail_params_' + local.task.getId(),
                title: lang['forms']['send_mail_params']['params'],
                sizes: {
                    height: '450px',
                    width: '450px'
                },
                buttons: {
                    save_all: {
                        title: lang['forms']['send_mail_params']['save_all'],
                        callback: function (win) {
                            win.loading(true);
                            self.send('all', function (result) {
                                win.loading();
                                win.hide();
                            });
                        },
                        additional_class: '--full --right'
                    },
                    save_local: {
                        title: lang['forms']['send_mail_params']['save_local'],
                        callback: function (win) {
                            win.loading(true);
                            self.send('local', function (result) {
                                win.loading();
                                win.hide();
                            });
                        },
                        additional_class: '--full --right'
                    },
                    cancel: {
                        title: lang['forms']['send_mail_params']['cancel'],
                        callback: function (win) {
                            win.hide();
                        },
                        additional_class: '--empty --right'
                    }
                },
                content: function () {
                    return self.renderParams();
                },
                no_scroll: false
            }).show();
        },
        /**
         *
         * @returns {*}
         */
        renderParams: function () {
            let local_params = Forms.localMailParams(local.task);
            let task_params = local.task_params = local.task.getGateways();
            let gateway = {};
            if (local_params) {
                gateway = local_params;
            } else if (task_params) {
                gateway = task_params;
            } else {
                gateway = local.default_gateway;
            }

            local.template = self.renderForm(gateway, local_params);
            let bind = function () {
                $('#override_theme', local.template).on('change', function () {
                    let checked = !$(this).prop('checked');
                    $('#theme_text', local.template).prop('disabled', checked);
                });
                $('#override_theme', local.template).trigger('change');
            };

            $('.information-default', local.template).on('click', function () {
                let old = local.template;
                old.hide();
                Forms.localMailParams(local.task, 'delete');
                local.template = self.renderForm(task_params || local.default_gateway);
                old.after(local.template);
                old.remove();
                bind();
            });
            bind();
            return local.template;
        },
        /**
         * проп=рисовка форимы
         * @param gateway
         * @param local_params
         * @returns {Mixed|jQuery|HTMLElement}
         */
        renderForm: function (gateway, local_params) {
            let lang = Lang.get()['forms']['gateway'];
            let form = $(Template.render('forms', 'comment/send_mail_param', ((local_params) ? {local: true} : {})));

            let list = new List.TaskGateways(local.task.getParentProject().getParentOrganization(), '--get-data');
            list.load();
            let selects = $('.selects', form);
            let checkboxes = $('.checkboxes', form);
            let inputs = $('.inputs', form);
            list.convertToSelect(gateway['send_from_gateway']).appendTo(selects);

            Elements.checkbox('show_prefix', lang['show_prefix'], gateway['show_prefix'], '--get-data').appendTo(checkboxes);
            Elements.checkbox('show_postfix', lang['show_postfix'], gateway['show_postfix'], '--get-data').appendTo(checkboxes);
            Elements.checkbox('individual', lang['individual'], gateway['individual'], '--get-data').appendTo(checkboxes);
            Elements.checkbox('save-original', lang['save-original'], gateway['save-original'], '--get-data').appendTo(checkboxes);
            Elements.checkbox('file-attach', lang['file-attach'], gateway['file-attach'], '--get-data').appendTo(checkboxes);
            Elements.checkbox('read-notify', lang['read-notify'], gateway['read-notify'], '--get-data').appendTo(checkboxes);
            let override_theme = Elements.checkbox('override_theme', lang['override_theme'] + ':', gateway['override_theme'], '--get-data').appendTo(checkboxes);
            let theme_text = Elements.simpleInput('theme_text', lang['theme_text'], '--get-data').appendTo(inputs);
            theme_text.data('input').val(gateway['theme_text']);
            if (!gateway['override_theme'].toString().toBoolean()) {
                theme_text.data('input').attr('disabled', true);
            }
            override_theme.data('checkbox').on('change', function () {
                switch ($(this).prop('checked')) {
                    case true:
                        theme_text.data('input').attr('disabled', false);
                        break;
                    case false:
                        theme_text.data('input').attr('disabled', true);
                        break;
                }
            });
            return form;
        },
        /**
         * получим контент
         * @returns {null}
         */
        html: function () {
            return local.template;
        },
        /**
         * вернем
         * @param callback
         */
        send: function (target, callback) {
            let data = self.getData();
            switch (target) {
                case 'local':
                    Forms.localMailParams(local.task, data);
                    callback();
                    break;
                case 'all':
                    Forms.localMailParams(local.task, 'delete');
                    local.task.saveGateway(data, function () {
                        callback();
                    });
                    break;
            }
        },
        /**
         * данные из формы
         * @returns {{}}
         */
        getData: function () {
            let object = {};
            local.template.find('.--get-data').each(function (i, item) {
                let id = '';
                let val = '';
                switch (true) {
                    case $(item).is('select'):
                        id = 'send_from_gateway';
                        val = $(item).val();
                        break;
                    case $(item).is('input[type=checkbox'):
                        id = $(item).attr('id').replace('checkbox__', '');
                        val = $(item).prop('checked');
                        break;
                    case $(item).is('input[type=text'):
                        id = $(item).attr('id');
                        val = $(item).val();
                        break;
                }
                object[id] = val;
            });
            return object;
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