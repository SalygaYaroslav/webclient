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
         * ��������
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
                // �������� ��� �� �������� � ��� ��������
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

            // �������� �� ������, � ������� ������ ��������
            if (local.task.getId() == 8501) {
                tabs_html.addClass('without-header');
            }
        },
        /**
         * ���� ��������
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
         * ������ ������
         * @param task
         */
        setTask: function (task) {
            local.task = task;
        },
        /**
         * ������ �������
         * @param comment
         */
        setComment: function (comment) {
            local.comment = comment;
        },
        /**
         * ������ ��������
         * @param callback
         */
        setCancelCallback: function (callback) {
            if (typeof callback == 'function') {
                local.cancel_callback = callback;
            }
        },
        /**
         * ������ ��������
         * @param callback
         */
        setSendCallback: function (callback) {
            if (typeof callback == 'function') {
                local.send_callback = callback;
            }
        },
        /**
         * ������� ������
         * @returns {null}
         */
        html: function () {
            return local.template;
        },
        /**
         * �������� �� ������
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
         * ����� ���������
         * @param success
         * @returns {*}
         */
        beforeSend: function (success) {
            let lang = Lang.get()['forms']['comment'];
            // ��������� ���� ��������� ������������ � ������ ���������, ���� ��� ���, �� �������
            // ��������������� ���������, ��������� ������������� ������� ��������� ��� �������� ��� ����������
            let task = local.task;
            let project = task.getParentProject();
            let org = project.getParentOrganization();
            local.temp.assign_type = self.getAssignType();
            local.temp.assign_user = ((self.getAssignUser() == '0') ? 0 : Dataset.get('user', self.getAssignUser()));
            local.temp.is_email = local.template.hasClass('to-email');
            local.temp.email_target = $('#email-target', local.template).val().split(';').join(',');
            local.temp.email_theme = $('#email-theme', local.template).val();
            // ����� ���������� ����
            let dialog_array = [];

            let notification_user_logins = local.temp.participants.users;
            let contact_ids = local.temp.participants.contacts;
            // �������� ������
            let users_array = [];
            if (local.temp.assign_user) {
                users_array.push(local.temp.assign_user);
            }
            // �������� ���������
            let fired_users = [];
            let no_assign_users = [];
            let no_notification_users = [];
            let no_writer_users = [];
            // writers. �� ���������� ������������ � ������
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
                    // ���� ��������� - ����������
                    if (assigned_user_id == writer) {
                        continue;
                    }
                    // ���� ����� ������ - ����
                    if (local.temp.participants.users.indexOf(writer) != '-1') {
                        continue;
                    }
                    // ���� � ���� ��� ������� ������ - ����
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
                    // ������� ���������
                    if (org.userInFired(user)) {
                        fired_users.push(user.getName());
                    } else {
                        // �������� �� �������������, ������� �� ����� ������
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
            // ���� ��� ���� - �������� ���� � ������
            if (fired_users.length > 0) {
                Notice.modal(lang['error'],
                    Lang.get()['forms']['errors_text']['fired_user' + ((fired_users.length > 0) ? 's' : '')].replace('%%users%%', fired_users.join(', ')),
                    function () {
                    });
            } else {
                // ����� ��� ���������, ���� ������
                // ���� ��� �����
                if (local.temp.is_email) {
                    let gateway = self.getGatewayParams();
                    // �������� ������������
                    if (local.temp.email_target == '' && contact_ids.length == 0) {
                        return Notice.error(lang['no_recipients']);
                    }
                    // ���� ���� ���� - � ��������� ������ ��
                    if (local.temp.email_theme != '') {
                        gateway.theme = '1';
                        gateway.themetext = local.temp.email_theme;
                    }
                    // �������� ������ �� ����������
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
                // �������� ��� ������� ������ ������������, �������� ����������
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
                // �������� ������, ������� �� ����� ������
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
                // �������� ������, ������� ���������� ����������
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
                        // �������� �� ����������
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
         * ������� ������������ �������
         * @param comment
         */
        setReplyComment: function (comment) {
            $('#email-target', local.template).val(comment.getRecipients().join(';'));
            $('.tab-header-item#email', local.template).trigger('click');
            local.temp.reply_comment = comment;
        },
        /**
         * ������������ �������
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
                sign = '-- \n� ���������, ' + user.getName() + ', ' + organization.getName().encode();
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
                let reg_exp = new RegExp('(����|�����|����|����)', 'gi');
                if (reg_exp.test(sub) == false) {
                    prefix = lang['hello'];
                }
            } else {
                prefix = lang['hello'];
            }
            return prefix;
        },
        /**
         * ����
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
            // ���� �������� ��� ������������
            if (local.task.getId() == '8501') {
                message = '(web): ' + message;
            }
            return message.toString().replace(/\r\n|\r|\n/g, '<br>');
        },
        /**
         * ��� ������ ��� ����������
         * @returns {*|jQuery}
         */
        getAssignType: function () {
            return $('.button.--switch.active', local.template).attr('id');
        },
        /**
         * ����������
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
            //========= ������ ������� ����� ���� ��� �������� ������ ��������
            /**
             * �����:
             * comment_added �� ����� ���� � comment_added_personal
             * comment_added �� ����� ���� � task_appointed
             * comment_added �� ����� ���� � response_needed
             * comment_added �� ����� ���� � task_appoint_reset
             * comment_added �� ����� ���� � response_needed
             * comment_added �� ����� ���� � task_state_changed
             *
             * comment_added ����� ���� � comment_notification ���� ����� ���������� ���
             *
             *
             * task_appointed ����� ���� � comment_added_personal
             * task_appoint_reset ����� ���� � comment_added_personal
             *
             * ============================================================
             * ������ �������� ����� � ������ ��� ���� ������������ ������� ����� ������������ � �� ��
             * ���� ���������� ����� �������:
             * ----------------------------------
             * ������� �������������� ����� ���� ��������� � ����������, ��������:
             *
             * ������ ���������: �������� ����������
             * ������������ ����������� ��� �������������: ��������� �����������, ������ �����
             * ���������� ����������: ������ �������
             *
             * ============================================================
             * comment_notification - ����� �� � ���������� ����������� ������
             * <response_needed from_login="wizzymails@gmail.com" of_whom_login="f.o.r.t@mail.ru"/> ����� �� ����������� ������ ����� ������ ����������
             *
             * ������ ��������� ����� ��� ����� ������, ��� ���� ����� �� ����� ���������� ����������:
             * ---------------------------------
             * ���� ������� ��������������
             *
             * ����� ������ �� ������������ �������� ����������
             * ������������ ����������� ��� �������������: ��������� �����������
             * ���������� ����������: ������ �������
             *
             */

                //������� ���������, ��� ���� � ���� �������� � ���� ���
            let isTaskAppointed = false; // ���������� ������
            let isTaskAppointReset = false; // ����� ���������� ������
            let isCommentsAddedPersonal = false; // ������������ �����������
            let isCommentNotification = false; // ����������
            let isResponseNeeded = false; // ����� ������

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

            // ���� �� ���������� ������
            // && _private.newComment.openTaskChoice != "personal"
            if (is_email == false && assign_type == 'assign' && assign_user != 0) {
                if (assign_user.getLogin() != task_author.getLogin()) {
                    isTaskAppointed = true;
                }
            }
            //����� �� ���������� ������
            if (is_email == false && assign_type == 'assign' && assign_user == 0 && local.temp.assign_user == 0) {
                if (task_author.getLogin() && task_author.getLogin() != '' && task_author.getLogin() != 'empty') {
                    isTaskAppointReset = true;
                }
            }
            //������������ �����������
            if (local.temp.dialog_data.addwriters.length > 0) {
                isCommentsAddedPersonal = true;
            }
            // ���� �� ����������
            if (local.temp.dialog_data.loudalertlogins.length > 0)
                isCommentNotification = true;
            // ����� �� ������
            if (assign_type == "response" && local.temp.dialog_data.vcNeedResponse)
                isResponseNeeded = true;
            // // ������� �� ������ ������
            // if (_private.newComment.stateId != this.getParentTask().getStatus().id)
            //     isStateChanged = true;
            // // ----
            //�������� �����������
            if (is_email == false && !isTaskAppointed && !isTaskAppointReset && !isCommentsAddedPersonal && !isResponseNeeded) {
                com_header += "<comment_added />";
            }
            //������ ���������
            if (isTaskAppointed) {
                com_header += '<task_appointed login="' + assign_user.getLogin() + '" />';
            }
            //����� ���������� � ������
            if (isTaskAppointReset) {
                com_header += "<task_appoint_reset />";
            }
            //������������ ����������� ��� ������������
            if (isCommentsAddedPersonal) {
                com_header += '<comment_added_personal login="' + addwriters_login.join(',') + '" />';
            }
            //������������ ����� ������ ��
            if (isResponseNeeded) {
                com_header += '<response_needed from_login="' + Authorization.getCurrentUser().getLogin() + '" of_whom_login="' + Dataset.get('user', local.temp.dialog_data.vcNeedResponse).getLogin() + '" />';
            }
            //���������� ����������: ������������ ����, ������������ ���
            if (isCommentNotification) {
                com_header += '<comment_notification login="' + loudalertlogins_login.join(',') + '" />';
            }
            //��������� ������
            //Email: Re[4]: �������� ������ (x12138C), 11111 qwqwqw12@wqwq.qw,22 22@22.22,3 2323@qwe.23,3 qweqe@qwe.qwe  (*��������� ������)
            if (local.temp.is_email) {
                let gatewayParams = self.getGatewayParams();
                let theme = local.temp.email_theme || local.task.getName();
                if (gatewayParams.override_theme) {
                    theme = gatewayParams.theme_text;
                }
                com_header += '<mail_sent theme="' + theme.replace(/"/gi, '&quot;') + '" recipients="' + local.temp.email_target + '" />';
            }
            //���������� ����������� com_header
            com_header += "</comment_header>";
            return com_header;
        },
        /**
         * ��������
         * @param com_header
         * @returns {*}
         */
        getSystemTitle: function (com_header) {
            return Comments.parseComHeader(com_header);
        },
        /**
         * ������������
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
         * ������� ������
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
         * �������� �����
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
         * ��������� �����
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