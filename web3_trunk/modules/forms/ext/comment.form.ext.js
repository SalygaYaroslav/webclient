Forms.Comment = function (task) {
    let local = {
        task: task || null,
        template: null,
        comment_block: null,
        user_select: null,
        cancel_callback: function () {
        },
        send_callback: function () {
        },
        temp: {
            form_id: new Date().getTime(),
            participants: {
                users: [],
                contacts: []
            },
            is_email: false,
            assign_type: '',
            assign_user: '',
            email_target: '',
            email_theme: '',
            dialog_data: {},
            reply_comment: null
        }
    };
    let self = {
        /**
         * построим
         * @param force_content
         */
        build: function (force_content) {
            let form = local.template = $('<div class="form --comment">');
            /** set tabs */
            let lang = Lang.get();
            let tabs = new Tabs({
                tab_id: 'comment_send_' + local.task.getId(),
                items: {
                    comment: {
                        title: lang['forms']['comment']['comment'],
                        content: function (block) {
                            local.comment_block = block;
                            self.buildCommentBlock();
                        },
                        callback: function (data) {
                            form.switchClass('to-email', 'to-comment');
                        }
                    },
                    email: {
                        title: lang['forms']['comment']['email'],
                        other: 'comment',
                        callback: function (data) {
                            form.switchClass('to-comment', 'to-email');
                        }
                    }
                },
                custom: Template.render('forms', 'comment/comment_header_custom')
            });
            let tabs_html = tabs.html();
            form.addClass('to-comment').append(tabs_html);
            /** select */
            let custom_header = $('.tab-header-custom', form);
            let select = local.user_select = new List.Users();
            select.sortByName();
            let author_id = false;
            try {
                author_id = local.task.getAuthor().getId();
            } catch (e) {
            }
            $('.select-block', custom_header).append(select.convertToSelect(true, author_id || 0));
            /** input */
            $('.email-block', custom_header).append(Elements.simpleInput('email-target', lang['forms']['comment']['target']));
            $('.email-block', custom_header).append(Elements.simpleInput('email-theme', lang['forms']['comment']['theme']));
            /** bind */
            custom_header.undelegate('.--switch', 'click').delegate('.--switch', 'click', function () {
                custom_header.find('.active').removeClass('active');
                $(this).addClass('active');
            });
            custom_header.undelegate('#notification_users', 'click').delegate('#notification_users', 'click', function () {
                // проверим что за контакты у нас остались
                local.temp.participants.contacts = $('#email-target', form).val().split(';');
                new Forms.CommentParticipants(local.temp.participants, function (data) {
                    if (data) {
                        local.temp.participants = data;
                    }
                    if (local.temp.participants.contacts.length > 0) {
                        $('.tab-header-item#email', form).trigger('click');
                        $('#email-target', form).val(local.temp.participants.contacts.join(';'));
                    }
                });
            });
            custom_header.undelegate('#email-target', 'keyup').delegate('#email-target', 'keyup', function () {
                local.temp.participants.contacts = $(this).val().split(';');
            });
            custom_header.undelegate('#mail_param', 'click').delegate('#mail_param', 'click', function () {
                new Forms.SendMailParams(local.task);
            });
            /** buttons */
            let button_block = $('<div class="buttons"><div class="toleft"></div><div class="toright"></div></div>').appendTo(form);

            let upload = Upload.getIconButton(local.temp.form_id, 'comment-upload', local.task, '--full --left', function (file, index) {
                self.appendFile(file, index);
            }).appendTo($('.toleft', button_block));
            /** delegate */
            $('.comment-files', local.template).undelegate('.close', 'click').delegate('.close', 'click', function () {
                self.removeFile($(this).parents('.file-item').eq(0).attr('id'));
            });
            new Elements.button('save', lang['forms']['comment']['send'], '--full --right').on('click', function () {
                self.send();
            }).appendTo($('.toright', button_block));
            new Elements.button('cancel', lang['forms']['comment']['cancel'], '--empty --right').on('click', function () {
                self.reload();
                local.cancel_callback();
            }).appendTo($('.toright', button_block));
            /** go */
            tabs.setContent(force_content || 'comment');

            // проверка на задачи, в которых скрыты элементы
            if (local.task.getId() == 8501) {
                tabs_html.addClass('without-header');
            }
        },
        /**
         * блок коммента
         */
        buildCommentBlock: function () {
            let block = local.comment_block.empty();
            let form = $(Template.render('forms', 'comment/form'));
            block.append(form);
            Upload.setFormDrop(local.temp.form_id, local.task, block, function (file, index) {
                self.appendFile(file, index);
            });
            let area = $('#comment', form);
            area.setCaretEnd();
        },
        /**
         * введем задачу
         * @param task
         */
        setTask: function (task) {
            local.task = task;
        },
        /**
         * введем коммент
         * @param comment
         */
        setComment: function (comment) {
            local.comment = comment;
        },
        /**
         * калбек закрытия
         * @param callback
         */
        setCancelCallback: function (callback) {
            if (typeof callback == 'function') {
                local.cancel_callback = callback;
            }
        },
        /**
         * калбек отправки
         * @param callback
         */
        setSendCallback: function (callback) {
            if (typeof callback == 'function') {
                local.send_callback = callback;
            }
        },
        /**
         * получим шаблон
         * @returns {null}
         */
        html: function () {
            return local.template;
        },
        /**
         * отправим на сервер
         */
        send: function () {
            let lang = Lang.get()['forms']['comment'];
            $('.comment-files', local.template).find('.file-item').removeClass('error');
            $('.comment-files', local.template).find('.file-item').removeClass('success');
            self.beforeSend(function (data) {
                local.template.addClass('sending');
                Interface.Load.show(lang['load_files']);
                Upload.startQueueUpload(local.temp.form_id, function (data_file) {
                    let item = $('.comment-files', local.template).find('#' + data_file.id);
                    let progress = ((parseInt(data_file.progress) >= 99) ? 100 : parseInt(data_file.progress));
                    $('.progress', item).css('right', (100 - progress) + '%');
                }, function (file_id, status) {
                    $('.comment-files', local.template).find('#' + file_id).addClass(status);
                }, function (files) {
                    let valid = true;
                    for (let id in files) {
                        if (files.hasOwnProperty(id)) {
                            if (files[id].status != 'success') {
                                valid = false;
                            }
                        }
                    }
                    if (valid == true) {
                        Interface.Load.show(lang['send_comment']);
                        Request.sendCommentToServer(local.task, data, files, local.temp.is_email, function (req, body) {
                            let scene = Scene.getSceneObject();
                            if (typeof data.vcTo != 'undefined') {
                                local.task.setAuthor(data.vcTo);
                                let author = '';
                                if (data.vcTo == '' || data.vcTo == 0) {
                                    author = lang['no_vc_to'];
                                } else {
                                    author = Dataset.Tree.getUserByLogin(data.vcTo).getName();
                                }
                                scene.swithTaskAuthor(author);
                            }
                            let new_comment = scene.appendComment(body);
                            scene.scrollTo(new_comment);
                            local.template.removeClass('sending');
                            Interface.Load.hide();
                            local.cancel_callback();
                            self.reload();
                        });
                    } else {
                        Interface.Load.hide();
                    }
                });
            });
        },
        /**
         * перед отправкой
         * @param success
         * @returns {*}
         */
        beforeSend: function (success) {
            let lang = Lang.get()['forms']['comment'];
            // проверяем если выбранный пользователь в группе уволенных, если это так, то выводим
            // соответствующее сообщение, проверяем пользователей которым назначаем или выбираем для оповещения
            let task = local.task;
            let project = task.getParentProject();
            let org = project.getParentOrganization();
            local.temp.assign_type = self.getAssignType();
            local.temp.assign_user = ((self.getAssignUser() == '0') ? 0 : Dataset.get('user', self.getAssignUser()));
            local.temp.is_email = local.template.hasClass('to-email');
            local.temp.email_target = $('#email-target', local.template).val().split(';').join(',');
            local.temp.email_theme = $('#email-theme', local.template).val();
            // набор диалоговых окон
            let dialog_array = [];

            let notification_user_logins = local.temp.participants.users;
            let contact_ids = local.temp.participants.contacts;
            // проверим юзеров
            let users_array = [];
            if (local.temp.assign_user) {
                users_array.push(local.temp.assign_user);
            }
            // проверим уволенных
            let fired_users = [];
            let no_assign_users = [];
            let no_notification_users = [];
            let no_writer_users = [];
            // writers. им отправляли персональным в задаче
            let writers = [];
            let particulars = [];
            let writer_field = local.task.getEntityField('writers');
            if (local.temp.is_email == false && writer_field && writer_field != 'all') {
                writers = writer_field.split(',').clearEmpty();
            }
            let particular_field = local.task.getEntityField('particular_users');
            if (local.temp.is_email == false && particular_field && particular_field != 'all') {
                particulars = particular_field.split(',').clearEmpty();
            }
            if (writers.length > 0) {
                let assigned_user_id = ((local.temp.assign_user == 0) ? 0 : local.temp.assign_user.getId());
                for (let i = 0; i < writers.length; i++) {
                    let writer = writers[i];
                    // если назначена - пропускаем
                    if (assigned_user_id == writer) {
                        continue;
                    }
                    // если нужен отклик - тоже
                    if (local.temp.participants.users.indexOf(writer) != '-1') {
                        continue;
                    }
                    // если у него уже просили отклик - тоже
                    if (particulars.indexOf(writer) != '-1') {
                        continue;
                    }
                    no_writer_users.push(Dataset.get('user', writer));
                }
            }
            for (let i = 0; i < notification_user_logins.length; i++) {
                let user = Dataset.Tree.getUserByLogin(notification_user_logins[i]);
                if (user.getId() != self.getAssignUser()) {
                    users_array.push(user);
                    // добавим уволенных
                    if (org.userInFired(user)) {
                        fired_users.push(user.getName());
                    } else {
                        // проверим на пользователей, которые не видят задачу
                        if (local.task.isUserReader(user) == false) {
                            no_notification_users.push(user);
                        }
                    }
                }
            }
            if (local.temp.is_email == false && local.temp.assign_user) {
                if (local.task.isUserReader(local.temp.assign_user) == false) {
                    no_assign_users.push(local.temp.assign_user);
                }
            }
            // если они есть - посылаем всех к чертям
            if (fired_users.length > 0) {
                Notice.modal(lang['error'],
                    Lang.get()['forms']['errors_text']['fired_user' + ((fired_users.length > 0) ? 's' : '')].replace('%%users%%', fired_users.join(', ')),
                    function () {
                    });
            } else {
                // иначе все нормально, идем дальше
                // если это почта
                if (local.temp.is_email) {
                    let gateway = self.getGatewayParams();
                    // проверим отправителей
                    if (local.temp.email_target == '' && contact_ids.length == 0) {
                        return Notice.error(lang['no_recipients']);
                    }
                    // если есть тема - в настройки вобьем ее
                    if (local.temp.email_theme != '') {
                        gateway.theme = '1';
                        gateway.themetext = local.temp.email_theme;
                    }
                    // проверим адреса на валидность
                    let mails = $('#email-target', local.template).val().split(';');
                    let invalid = [];
                    for (let i = 0; i < mails.length; i++) {
                        let regexp = new RegExp('^[-a-z0-9!#$%&\'*+/=?^_`{|}~]+(?:\.[-a-z0-9!#$%&\'*+/=?^_`{|}~]+)*@(?:[a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?\.)*(?:aero|arpa|asia|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel|[a-z][a-z])$');
                        if (regexp.test(mails[i]) == false) {
                            invalid.push(mails[i]);
                        }
                    }
                    if (invalid.length > 0) {
                        return Notice.error(lang['invalid_mail'] + ':<br>' + invalid.join('<br>'));
                    }

                }
                let dialog_data = {
                    addwriters: [],
                    loudalertlogins: [],
                    vcTo: function () {
                        let vc_to = '';
                        if (local.temp.is_email == false) {
                            if (local.temp.assign_type == 'assign' && local.temp.assign_user) {
                                vc_to = local.temp.assign_user.getId();
                                return vc_to;
                            }
                        }
                    }(),
                    vcNeedResponse: ((local.temp.assign_type == 'response' ? local.temp.assign_user.getId() : ''))
                };
                // проверим как открыть задачу пользователю, которому назначение
                if (no_assign_users.length > 0) {
                    dialog_array.push(function (callback) {
                        new Forms.CommentPersonal({type: '0', list: no_assign_users}, function (data) {
                            switch (data.type) {
                                case 'personal':
                                    dialog_data.addwriters.push(data.list);
                                    break;
                                case 'open':
                                    switch (local.temp.assign_type) {
                                        case 'assign':
                                            dialog_data.vcTo = data.list;
                                            break;
                                        case 'response':
                                            dialog_data.vcNeedResponse = data.list;
                                            break;
                                    }
                                    break;
                            }
                            callback();
                        });
                    });
                }
                // проверим юзеров, которые не видят задачу
                if (no_notification_users.length > 0) {
                    dialog_array.push(function (callback) {
                        new Forms.CommentPersonal({type: '1', list: no_notification_users}, function (data) {
                            switch (data.type) {
                                case 'personal':
                                    dialog_data.addwriters.push(data.list);
                                    break;
                                case 'open':
                                    dialog_data.loudalertlogins = data.list;
                                    break;
                            }
                            callback();
                        });
                    });
                }
                // проверим юзеров, которым отправляли персоналки
                if (no_writer_users.length > 0) {
                    dialog_array.push(function (callback) {
                        new Forms.CommentPersonal({type: '2', list: no_writer_users}, function (data) {
                            for (let id in data.list) {
                                if (data.list.hasOwnProperty(id) && data.list[id] == true) {
                                    dialog_data.addwriters.push(id);
                                }
                            }
                            callback();
                        });
                    });
                }
                let completeDialogs = function (array) {
                    if (array.length > 0) {
                        array[0](function () {
                            completeDialogs(array.cleanByIndex(0));
                        });
                    } else {
                        // data after dialogs
                        local.temp.dialog_data = dialog_data;
                        // com_header
                        let com_header = self.getComHeader();
                        let object = {
                            dtDeadline: local.task.getEntityField('dtDeadline'),
                            dtStart: local.task.getEntityField('dtStart'),
                            iStateID: local.task.getEntityField('iStateID'),
                            comment: self.getMessage(),
                            com_header: com_header,
                            system: self.getSystemTitle(com_header),
                        };
                        // проверка на спецзадачи
                        if (local.task.getId() == 8501) {
                            local.temp.dialog_data.addwriters.push(Authorization.getCurrentUser().getId());
                            object.comment = '(web): ' + object.comment;
                        }
                        switch (local.temp.is_email) {
                            case true:
                                let gateway = self.getGatewayParams();
                                object['send_mail'] = {
                                    '_prefix': ((gateway['show_prefix']) ? (self.getPrefix() + '').encode() : ''),
                                    '_postfix': ((gateway['show_postfix']) ? (self.getPostfix() + '').encode() : ''),
                                    '_name': ''.toString().encode(),
                                    '_sender': (Authorization.getCurrentUser().getName() + '').encode(),
                                    '_override-sender': gateway['override-sender'] || '0',
                                    '_individual': ((gateway['individual']) ? '1' : '0'),
                                    '_files': ((gateway['file-attach']) ? 'attach' : ''),
                                    '_email': local.temp.email_target,
                                    '__text': self.getTheme(gateway).replace(/"/gi, '%22'),
                                    '_reply_com_id': function () {
                                        try {
                                            return self.getReplyComment().getId();
                                        } catch (e) {
                                            return '';
                                        }
                                    }()
                                };
                                object['send_mail_xml'] = {'send_mail': object['send_mail']};
                                object['email_out'] = local.temp.email_target;
                                object['gatewayID'] = gateway['send_from_gateway'];
                                break;
                            case false:
                                object['addwriters'] = local.temp.dialog_data.addwriters.join(',');
                                object['loudalertlogins'] = function () {
                                    let array = [];
                                    for (let i = 0; i < local.temp.dialog_data.loudalertlogins.length; i++) {
                                        array.push(Dataset.get('user', local.temp.dialog_data.loudalertlogins[i]).getLogin());
                                    }
                                    return array.join(',');
                                }();
                                if (local.temp.dialog_data.vcNeedResponse) {
                                    object['vcNeedResponse'] = Dataset.get('user', local.temp.dialog_data.vcNeedResponse).getLogin();
                                } else {
                                    if (local.temp.dialog_data.vcTo) {
                                        object['vcTo'] = Dataset.get('user', local.temp.dialog_data.vcTo).getLogin();
                                    } else {
                                        object['vcTo'] = '';
                                    }
                                }
                                break;
                        }
                        success(object);
                    }
                };
                completeDialogs(dialog_array);
            }
        },
        /**
         * добавим пересылаемый коммент
         * @param comment
         */
        setReplyComment: function (comment) {
            $('#email-target', local.template).val(comment.getRecipients().join(';'));
            $('.tab-header-item#email', local.template).trigger('click');
            local.temp.reply_comment = comment;
        },
        /**
         * пересылаемый коммент
         * @returns {null}
         */
        getReplyComment: function () {
            return local.temp.reply_comment;
        },
        /**
         *
         * @returns {string}
         */
        getPostfix: function () {
            let sign = '';
            let reply = self.getReplyComment();
            let user = Authorization.getCurrentUser();
            let organization = local.task.getParentProject().getParentOrganization();
            let private_sign = user.getEntityField('privateSign');
            let org_sign = organization.getUserSign();
            if (reply) {
                sign = reply.getReplyText();
            } else if (org_sign) {
                sign = org_sign;
            } else if (private_sign) {
                sign = private_sign;
            } else {
                sign = '-- \nС уважением, ' + user.getName() + ', ' + organization.getName().encode();
            }
            return sign;
        },
        /**
         *
         * @returns {string}
         */
        getPrefix: function () {
            let lang = Lang.get()['forms']['comment'];
            let prefix = '';
            let message = self.getMessage();
            if (message) {
                let sub = message.substr(0, 100);
                let reg_exp = new RegExp('(прив|здрав|уваж|добр)', 'gi');
                if (reg_exp.test(sub) == false) {
                    prefix = lang['hello'];
                }
            } else {
                prefix = lang['hello'];
            }
            return prefix;
        },
        /**
         * тема
         * @param gateway
         * @returns {string}
         */
        getTheme: function (gateway) {
            let theme = local.temp.email_theme || '';
            if (gateway) {
                if (gateway['override_theme']) {
                    theme = gateway['theme_text'];
                }
            }
            return theme;
        },
        /**
         *
         * @returns {string}
         */
        getMessage: function () {
            let message = $('textarea#comment', local.template).val();
            // спец заглушка для техподдержки
            if (local.task.getId() == '8501') {
                message = '(web): ' + message;
            }
            return message.toString().replace(/\r\n|\r|\n/g, '<br>');
        },
        /**
         * тип отклик или назначение
         * @returns {*|jQuery}
         */
        getAssignType: function () {
            return $('.button.--switch.active', local.template).attr('id');
        },
        /**
         * назначение
         * @returns {*|jQuery}
         */
        getAssignUser: function () {
            return $('.select-block', local.template).find('select').eq(0).val();
        },
        /**
         *
         * @returns {string}
         */
        getComHeader: function () {
            let com_header = '<comment_header>';
            //========= случаи которые могут быть при отправке нового коммента
            /**
             * Мысли:
             * comment_added не может быть с comment_added_personal
             * comment_added не может быть с task_appointed
             * comment_added не может быть с response_needed
             * comment_added не может быть с task_appoint_reset
             * comment_added не может быть с response_needed
             * comment_added не может быть с task_state_changed
             *
             * comment_added может быть с comment_notification если всего остального нет
             *
             *
             * task_appointed может быть с comment_added_personal
             * task_appoint_reset может быть с comment_added_personal
             *
             * ============================================================
             * теперь проверим когда в задаче уже есть пользователи которые видят персональные и мы им
             * тоже отображаем новый коммент:
             * ----------------------------------
             * никаких неожиданностей ведет себя нормально с остальными, например:
             *
             * Задача назначена: Владимир Марчевский
             * Персональный комментарий для пользователей: Александр Македонский, Марина Любин
             * Отправлено оповещение: Никита Соколов
             *
             * ============================================================
             * comment_notification - когда мы у нескольких запрашиваем отклик
             * <response_needed from_login="wizzymails@gmail.com" of_whom_login="f.o.r.t@mail.ru"/> когда мы запрашивает отклик через селект назначения
             *
             * теперь проверяем когда нам нужен отклик, как себя ведет со всеми остальными вариантами:
             * ---------------------------------
             * тоже никаких неожиданностей
             *
             * Нужен отклик от пользователя Владимир Марчевский
             * Персональный комментарий для пользователей: Александр Македонский
             * Отправлено оповещение: Никита Соколов
             *
             */

                //сначала определим, что есть в этом комменте и чего нет
            let isTaskAppointed = false; // назначениа задача
            let isTaskAppointReset = false; // снято назначение задачи
            let isCommentsAddedPersonal = false; // персональный комментарий
            let isCommentNotification = false; // оповещение
            let isResponseNeeded = false; // нужен отклик

            let assign_type = local.temp.assign_type;
            let assign_user = ((local.temp.dialog_data.vcTo) ? Dataset.get('user', local.temp.dialog_data.vcTo) : 0);
            let task_author = local.task.getAuthor();
            let is_email = local.temp.is_email;

            let addwriters_login = [];
            for (let i = 0; i < local.temp.dialog_data.addwriters.length; i++) {
                addwriters_login.push(Dataset.get('user', local.temp.dialog_data.addwriters[i]).getLogin());
            }

            let loudalertlogins_login = [];
            for (let i = 0; i < local.temp.dialog_data.loudalertlogins.length; i++) {
                loudalertlogins_login.push(Dataset.get('user', local.temp.dialog_data.loudalertlogins[i]).getLogin());
            }

            // есть ли назначение задачи
            // && _private.newComment.openTaskChoice != "personal"
            if (is_email == false && assign_type == 'assign' && assign_user != 0) {
                if (assign_user.getLogin() != task_author.getLogin()) {
                    isTaskAppointed = true;
                }
            }
            //снято ли назначение задачи
            if (is_email == false && assign_type == 'assign' && assign_user == 0 && local.temp.assign_user == 0) {
                if (task_author.getLogin() && task_author.getLogin() != '' && task_author.getLogin() != 'empty') {
                    isTaskAppointReset = true;
                }
            }
            //персональный комментарий
            if (local.temp.dialog_data.addwriters.length > 0) {
                isCommentsAddedPersonal = true;
            }
            // есть ли оповещения
            if (local.temp.dialog_data.loudalertlogins.length > 0)
                isCommentNotification = true;
            // нужен ли отклик
            if (assign_type == "response" && local.temp.dialog_data.vcNeedResponse)
                isResponseNeeded = true;
            // // изменен ли статус задачи
            // if (_private.newComment.stateId != this.getParentTask().getStatus().id)
            //     isStateChanged = true;
            // // ----
            //Добавлен комментарий
            if (is_email == false && !isTaskAppointed && !isTaskAppointReset && !isCommentsAddedPersonal && !isResponseNeeded) {
                com_header += "<comment_added />";
            }
            //Задача назначена
            if (isTaskAppointed) {
                com_header += '<task_appointed login="' + assign_user.getLogin() + '" />';
            }
            //Снято назначение с задачи
            if (isTaskAppointReset) {
                com_header += "<task_appoint_reset />";
            }
            //Персональный комментарий для пользователя
            if (isCommentsAddedPersonal) {
                com_header += '<comment_added_personal login="' + addwriters_login.join(',') + '" />';
            }
            //Пользователю нужен отклик от
            if (isResponseNeeded) {
                com_header += '<response_needed from_login="' + Authorization.getCurrentUser().getLogin() + '" of_whom_login="' + Dataset.get('user', local.temp.dialog_data.vcNeedResponse).getLogin() + '" />';
            }
            //Отправлено оповещение: Пользователь Один, Пользователь Два
            if (isCommentNotification) {
                com_header += '<comment_notification login="' + loudalertlogins_login.join(',') + '" />';
            }
            //Исходящее письмо
            //Email: Re[4]: Тестовые письма (x12138C), 11111 qwqwqw12@wqwq.qw,22 22@22.22,3 2323@qwe.23,3 qweqe@qwe.qwe  (*исходящее письмо)
            if (local.temp.is_email) {
                let gatewayParams = self.getGatewayParams();
                let theme = local.temp.email_theme || local.task.getName();
                if (gatewayParams.override_theme) {
                    theme = gatewayParams.theme_text;
                }
                com_header += '<mail_sent theme="' + theme.replace(/"/gi, '&quot;') + '" recipients="' + local.temp.email_target + '" />';
            }
            //возвращаем построенный com_header
            com_header += "</comment_header>";
            return com_header;
        },
        /**
         * системка
         * @param com_header
         * @returns {*}
         */
        getSystemTitle: function (com_header) {
            return Comments.parseComHeader(com_header);
        },
        /**
         * перезагрузка
         */
        reload: function () {
            local.temp.participants = {
                users: [],
                contacts: []
            };
            $('textarea#comment', local.template).val('');
            $('input#email-target', local.template).val('');
            $('input#email-theme', local.template).val('');
            $('.tab-header-item#comment', local.template).trigger('click');
            local.user_select.setValue(local.task.getAuthor() ? local.task.getAuthor().getId() : 0);
            local.template.removeClass('--files');
            $('.comment-files', local.template).empty();
            $('.button.--switch#assign', local.template).trigger('click');
            local.temp.reply_comment = null;
            Upload.removeQueue(local.temp.form_id);
        },
        /**
         * добавим цитату
         * @param quote
         */
        appendQuote: function (quote) {
            let area = $('.textarea#comment', local.template);
            let text = area.val();
            area.val(((text) ? text + '\r\n' : '') + quote).setCaretEnd();
        },
        /**
         *
         * @param file
         * @param id
         */
        appendFile: function (file, id) {
            try {
                local.template.addClass('--files');
                $('.comment-files', local.template).append($(Template.render('forms', 'comment/file-item', file.extra)).attr('id', id));
            } catch (e) {
                console.log('file no append: ' + file);
            }
        },
        /**
         * удаление файла
         * @param id
         */
        removeFile: function (id) {
            try {
                if (Upload.removeFileFromQueue(local.temp.form_id, id)) {
                    $('.comment-files', local.template).find('#' + id).remove();
                    if ($('.comment-files', local.template).find('.file-item').length == 0) {
                        local.template.removeClass('--files');
                    }
                }
            } catch (e) {
                console.log('file not delete: ' + id);
            }
        },
        /**
         * параметры шлюза
         * @returns {*}
         */
        getGatewayParams: function () {
            let local_params = Forms.localMailParams(local.task);
            if (local_params != false) {
                return local_params;
            } else {
                return local.task.getGateways();
            }
        }
    };
    self.build();
    return self;
};