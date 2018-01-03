/**
 * сущность коммент
 * @param data - данные
 * @param likes - лайки
 * @param callbacks - калбек
 * @returns {*}
 * @constructor
 */
window.Comment = function (data, likes, callbacks) {
    /** private */
    this.local = {
        template: null,
        fields: {},
        likes: {},
        callbacks: {
            quote: function () {
            },
            resend: function () {
            }
        }
    };
    /** constructor */
    /** если xml пуста€ - вернем пустое */
    if (typeof data == 'undefined') {
        return {
            empty: true
        };
    } else {
        this.local.fields = data;
        this.local.likes = likes || {};
        this.local.callbacks = callbacks || {}
    }
};
Comment.prototype.getEntityField = function (field) {
    try {
        return this.local.fields[field];
    } catch (e) {
        return '';
    }
};
/**
 * получим ид
 * @returns {string}
 */
Comment.prototype.getId = function () {
    try {
        return this.local.fields.id;
    } catch (e) {
        return '';
    }
};
/**
 * получим родительскую задачу
 * @returns {*}
 */
Comment.prototype.getParentTask = function () {
    try {
        return Dataset.get('task',this.local.fields.task_id);
    } catch (e) {
        return '';
    }
};
/**
 * получим аватар создател€
 * @returns {string}
 */
Comment.prototype.getAuthorAvatar = function () {
    try {
        let avatar = '';
        switch (this.local.fields.author == 'system') {
            case false:
                let author = Dataset.get('user',this.local.fields['author_id']);
                avatar = author.getAvatar();
                break;
            case true:
                if (typeof this.local.fields['emailinfo'] != 'undefined' && this.local.fields['emailinfo'] !== '' && this.local.fields['emailinfo'] !== null) {
                    avatar = 'images/icons/comment_incoming.svg';
                } else {
                    avatar = 'images/logo.png';
                }
                break;
        }
        return avatar;
    }
    catch (e) {
        return '';
    }
};
/**
 * получим им€ создател€
 * @returns {string}
 */
Comment.prototype.getAuthorName = function () {
    try {
        let name = '';
        switch (this.local.fields.author == 'system' || this.local.fields.author == 'root') {
            case false:
                let author = Dataset.get('user',this.local.fields['author_id']);
                name = author.vmData.name || this.local.fields.author;
                break;
            case true:
                if (typeof this.local.fields['emailinfo'] != 'undefined' && this.local.fields['emailinfo'] !== '' && this.local.fields['emailinfo'] !== null) {
                    let spl = this.local.fields['emailinfo'].split('<');
                    let user = spl[0];
                    let spl2 = spl[1].split('>');
                    if (user == '') {
                        user = spl2[0];
                    }
                    name = user;
                } else {
                    name = Lang.get()['comment']["cls"]["system"];
                }
                break;
        }
        return name;
    }
    catch (e) {
        return '';
    }
};
/**
 * получим дату создани€
 * @returns {*}
 */
Comment.prototype.getCreatedDate = function () {
    try {
        return moment(this.local.fields['created'], 'YYYY-MM-DD HH:mm:ss').calendar();
    }
    catch (e) {
        return '';
    }
};
Comment.prototype.getIsEmail = function () {
    let type = '';
    if (typeof this.local.fields['send_mail_xml'] != 'undefined') {
        type = 'outgoing';
    }
    if (typeof this.local.fields['emailinfo'] != 'undefined') {
        type = 'incoming';
    }
    return type;
};
/**
 * получим контект
 * @param original - вывести без обработки
 * @returns {boolean}
 */
Comment.prototype.getContent = function (original) {
    try {
        if (original != true && this.local.fields.author == 'system' && this.getIsEmail() == 'incoming' && Authorization.getStorageConfig('show_comment_email_as_text')) {
            let text = this.getBody().replace(/<br\s*\/?>/mgi, '\r\n');
            let html_text = $('<div>' + text + '</div>');
            if ($.type(html_text) == 'object') {
                html_text = Tool.replaceTags(html_text);
            }
            text = $.trim(html_text.text());
            text = text.replace(/\n(\s*)\n(\s*)\n/mgi, '\n\n');
            text = text.replace(/\n/mgi, '<br>');
            return Template.render('comments', 'email', {text: text}).parseHTMLLinks();
        } else {
            let body = this.getBody().replace(/\r\n/mgi, '<br/>').parseHTMLLinks();
            body += this.checkResendMail();
            return body;
        }
    }
    catch (e) {
        return false;
    }
};
/**
 * проверка пересылки письма
 * @returns {string}
 */
Comment.prototype.checkResendMail = function () {
    try {
        let result = '';
        let body = $('send_mail', Tool.stringToXml(this.local.fields.send_mail_xml));
        let reply_com_id = body.attr('reply_com_id');
        if (reply_com_id) {
            result = Template.render('comments', 'resend_text', {
                text: Tool.decode(body.attr('postfix'))
            });
        }
        return result;
    } catch (e) {
        return '';
    }
};
/**
 * получим тело коммента
 * @returns {*|tabs.items.comment|{title, content, callback}|comment|{template, list, form, block}|string}
 */
Comment.prototype.getBody = function () {
    return this.local.fields.comment || this.local.fields.message || '';
};
/**
 * получим контент текста дл€ копировани€
 * @returns {*}
 */
Comment.prototype.getContentToCopy = function () {
    try {
        return $('<div>' + this.getBody().replace(/<br\s*\/?>/mg, '\r\n') + '</div>').text();
    }
    catch (e) {
        return '';
    }
};
/**
 * получим текст цитаты
 * @returns {*}
 */
Comment.prototype.getQuoteText = function () {
    let content = this.getCopyText();
    content = $.trim(content);
    content = '> ' + content.replace(/\n/mg, '\n> ') + '\n';
    return content;
};
/**
 * получим текст дл€ пересылки
 * @returns {string}
 */
Comment.prototype.getReplyText = function () {
    let lang = Lang.get()['comment']["cls"];
    let text = '<br>' + lang['outgoing'];
    text += '<br>' + lang['date'] + ': ' + this.getCreatedDate();
    text += '<br>' + lang['sender'] + ': ' + this.getEntityField('author');
    text += '<br>' + lang['recipients'] + ': ' + this.getRecipients().join(', ');
    text += '<br>' + lang['theme'] + ': ' + this.getMailTheme();
    text += '<br>> ' + $('<div>' + this.getBody().replace(/<br\s*\/?>/mg, '<br>> ') + '</div>').text();
    return text;
};
/**
 * получим тект дл€ копировани€
 * @returns {string}
 */
Comment.prototype.getCopyText = function () {
    let text = '';
    let files = this.getFileArray();
    let status = this.getStatus();
    let content = this.getContentToCopy();
    let name = this.getAuthorName();
    let date = this.getCreatedDate();
    text += name + ' - ' + date + ((status) ? ' - ' + status : '' ) + '\r\n';
    text += ((content) ? content + '\r\n' : '');
    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            text += files[i].name + ' ' + files[i].link + '\r\n';
        }
    }
    return text;
};
/**
 * получим ссылку дл€ копировани€
 * @returns {string}
 */
Comment.prototype.getCopyLink = function () {
    return 'prostoy://comment/' + this.getId();
};
/**
 * получим статус коммента
 * @returns {*}
 */
Comment.prototype.getStatus = function () {
    return Comments.parseComHeader(this.local.fields.com_header);
};
/**
 * тема письма
 * @returns {*}
 */
Comment.prototype.getMailTheme = function () {
    try {
        return $('mail_sent', Tool.stringToXml(this.local.fields.com_header)).attr('theme');
    } catch (e) {
        return '';
    }
};
/**
 * получим массив файлов
 * @returns {*}
 */
Comment.prototype.getFileArray = function () {
    let files_array = [];
    if (this.local.fields.files !== null && this.local.fields.files !== '') {
        let sources = '';
        if (typeof this.local.fields['filesshown'] != 'undefined' && this.local.fields['filesshown'] !== '') {
            sources = this.local.fields['filesshown'];
        } else if (typeof this.local.fields.files != 'undefined' && this.local.fields.files !== '') {
            sources = this.local.fields.files;
        } else if (typeof this.local.fields.links != 'undefined') {
            sources = this.local.fields.links;
        }
        if (sources == '') {
            files_array = [];
        }
        let splitter = /\r\n|\n/;
        let files = sources.split(splitter);
        let links = (this.local.fields.links) ? this.local.fields.links.split(splitter) : new Array(files.length);
        if (links.length > 0) {
            for (let f = 0; f < links.length; f++) {
                let file = files[f];
                if (!file) {
                    continue;
                }
                let link = links[f];
                let type = Tool.getFileType(link);
                let split = file.split(';');
                let size = split[0];
                let name = split[1];
                let preview = (type.type == 'image' && Authorization.getStorageConfig('show_comment_image_preview'));
                files_array.push({
                    name: name,
                    type: type,
                    size: size,
                    humanize_size: Tool.formatBytes(size),
                    preview: preview,
                    link: 'http://' + __web__.file_url + '/' + link
                });
            }
        }
    }
    return files_array.length > 0 ? files_array : false;
};
/**
 * введем калбеки
 * @param callbacks
 */
Comment.prototype.setCallbacks = function (callbacks) {
    this.local.callbacks = $.extend(this.local.callbacks, callbacks);
};
/**
 * получим объект лайков
 * @returns {{like: number, like_title: string, dislike: number, dislike_title: string}}
 */
Comment.prototype.getLikes = function () {
    let like = 0;
    let dislike = 0;
    let like_title = [];
    let like_ids = [];
    let dislike_ids = [];
    let dislike_title = [];
    if (typeof this.local.likes != 'undefined') {
        for (let id in this.local.likes) {
            if (this.local.likes.hasOwnProperty(id)) {
                switch (this.local.likes[id].result) {
                    case '1':
                        like++;
                        like_title.push(Dataset.get('user',this.local.likes[id]['user_id']).getName());
                        like_ids.push(this.local.likes[id]['user_id']);
                        break;
                    case '-1':
                        dislike++;
                        dislike_title.push(Dataset.get('user',this.local.likes[id]['user_id']).getName());
                        dislike_ids.push(this.local.likes[id]['user_id']);
                        break;
                }
            }
        }
    }
    return {
        like: like,
        like_title: like_title.join('\r\n'),
        like_ids: like_ids.join(','),
        dislike: dislike,
        dislike_title: dislike_title.join('\r\n'),
        dislike_ids: dislike_ids.join(',')
    }
};
/**
 * получим com_header
 * @param original
 * @returns {*|string}
 */
Comment.prototype.getComHeader = function (original) {
    if (original) {
        return this.local.fields.com_header || '';
    }
};
/**
 * получим цвет категории
 * @returns {*}
 */
Comment.prototype.getCategoryColor = function () {
    try {
        if (this.local.fields.cat_id && this.local.fields.cat_id != '0') {
            let category = Dataset.get('category',this.local.fields.cat_id);
            return {
                id: category.getId(),
                color: category.getColor(),
                title: category.getName(),
                full: Authorization.getStorageConfig('show_comment_category_full')
            };
        }
        return false;
    } catch (e) {
        return false;
    }
};
/**
 * изменим категорию на сервере
 * @param id
 * @param callback
 */
Comment.prototype.changeCategory = function (id, callback) {
    try {
        if (this.local.fields.cat_id != id) {
            let self = this;
            Request.commentCategoryEdit(self, id, function () {
                callback();
                if (self.local.template) {
                    self.reload();
                }
            });
        } else {
            callback();
        }
    } catch (e) {
        callback();
    }
};
/**
 * изменим категорию на сервере
 * @param id
 * @param copy
 * @param callback
 */
Comment.prototype.changeTask = function (id, copy, callback) {
    try {
        let self = this;
        Request.commentMoveToOtherTask(self, id, copy, function (data) {
            let xml = data.xml();
            if (xml.attr('status') == 'OK') {
                if (copy == false) {
                    self.removeFromList();
                }
                callback(true);
            } else {
                callback('request');
            }
        });
    } catch (e) {
        callback(false);
    }
};
/**
 * получим избранное
 * @returns {*}
 */
Comment.prototype.getFavorite = function () {
    try {
        return this.local.fields.is_favorite;
    } catch (e) {
        return 0
    }
};
/**
 * прорисуем коммент
 */
Comment.prototype.drawSimple = function () {
    let self = this;
    let comment = {
        id: self.getId(),
        avatar_url: self.getAuthorAvatar(),
        name: self.getAuthorName(),
        status: self.getStatus(),
        date: self.getCreatedDate(),
        category: self.getCategoryColor(),
        content: function () {
            let text = self.getContent();
            let files = self.getFileArray();
            if (text == false && files == false) {
                return false;
            } else {
                return {
                    text: text,
                    files: files
                }
            }
        }(),
        is_favorite: self.getFavorite(),
        is_email: self.getIsEmail(),
        likes: self.getLikes()
    };
    // hide like if 88242
    if (this.getParentTask().getId() == 88242) {
        comment.hide_like = true;
    }
    this.local.template = $(Template.render('comments', 'simple_comment', comment));
    /** binds */
    /** copy text */
    new Clipboard($('.comment-buttons > #copy', this.local.template)[0], {
        text: function () {
            return self.getCopyText();
        }
    }).on('success', function () {
        Notice.notify(Lang.get()['comment']['notice']['copy_text']);
    }).on('error', function () {
        Notice.error(Lang.get()['comment']['notice']['error_copy']);
    });
    /** copy link */
    new Clipboard($('.comment-buttons > #copy_link', this.local.template)[0], {
        text: function () {
            return self.getCopyLink();
        }
    }).on('success', function () {
        Notice.notify(Lang.get()['comment']['notice']['copy_link']);
    }).on('error', function () {
        Notice.error(Lang.get()['comment']['notice']['error_copy']);
    });
    /** category */
    $('.comment-buttons > #category', this.local.template).on('click', function () {
        new Forms.Category(self);
    });
    /** quote */
    $('.comment-buttons > #quote', this.local.template).on('click', function () {
        if (self.local.callbacks && typeof self.local.callbacks.quote == 'function') {
            let quote = self.getQuoteText();
            self.local.callbacks.quote(quote);
        }
    });
    /** resend */
    $('.comment-buttons > #resend', this.local.template).on('click', function () {
        if (self.local.callbacks && typeof self.local.callbacks.resend == 'function') {
            self.local.callbacks.resend(self);
        }
    });
    /** favorite */
    $('.comment-buttons > #favorite', this.local.template).on('click', function () {
        if ($(this).hasClass('load_now')) {
            return false;
        }
        $(this).addClass('load_now');
        let now = $(this).find('.rel').attr('rel');
        let value = ((now == '1') ? '0' : '1');
        Request.commentChangeFavorite(self, value, function () {
            $(this).removeClass('load_now');
            self.reload();
        });
    });
    /** move */
    $('.comment-buttons > #move', this.local.template).on('click', function () {
        new Forms.CommentMove(self);
    });
    $('.likes > .like', this.local.template).on('click', function () {
        let ids = $(this).attr('rel') || '';
        if (ids.split(',').indexOf(Authorization.getCurrentUser().getId()) == '-1') {
            // change
            let own_id = null;
            if (Object.keys(self.local.likes).length > 0) {
                for (let id in self.local.likes) {
                    if (self.local.likes.hasOwnProperty(id)) {
                        if (self.local.likes[id]['user_id'] == Authorization.getCurrentUser().getId()) {
                            own_id = id;
                        }
                    }
                }
            }
            Request.commentLike(self, '1', function () {
                Dataset.checkNews();
            }, own_id);
        }
    });
    $('.likes > .dislike', this.local.template).on('click', function () {
        let ids = $(this).attr('rel') || '';
        if (ids.split(',').indexOf(Authorization.getCurrentUser().getId()) == '-1') {
            // change
            let own_id = null;
            if (Object.keys(self.local.likes).length > 0) {
                for (let id in self.local.likes) {
                    if (self.local.likes.hasOwnProperty(id)) {
                        if (self.local.likes[id]['user_id'] == Authorization.getCurrentUser().getId()) {
                            own_id = id;
                        }
                    }
                }
            }
            Request.commentLike(self, '-1', function () {
                Dataset.checkNews();
            }, own_id);
        }
    });
    $('.show-full-version', this.local.template).on('click', function () {
        new Windows({
            id: self.getId(),
            title: self.getStatus(),
            sizes: {
                height: '90%',
                width: '90%'
            },
            buttons: {
                close: {
                    title: Lang.get()['forms']['category']['cancel'],
                    callback: function (win) {
                        win.hide();
                    },
                    additional_class: '--empty --right'
                }
            },
            content: function () {
                let frame = $('<iframe id="original-comment" name="save-web" class="save-web-from-other">').ready(function () {
                    setTimeout(function () {
                        frame.contents().find('body').css({
                            margin: 0,
                            padding: 0
                        }).append(self.getContent(true));
                    }, 50);
                });
                return frame;
            },
            no_scroll: true
        }).show();
    });
    $('.resend_text > .switch', this.local.template).on('click', function () {
        let parent = $(this).parents('.resend_text').eq(0);
        if (parent.hasClass('hide')) {
            parent.switchClass('hide', 'show', 0);
        } else {
            parent.switchClass('show', 'hide', 0);
        }
    });
    return this.local.template.data('comment', self);
};
/**
 * перерисуем коммент
 */
Comment.prototype.reload = function () {
    let self = this;
    Dataset.getEntityFromServer('comment', self.getId(), function (type, id, data) {
        let xml = data.xml();
        let comment = $('comment', xml)[0];
        self.local.fields = Tool.xmlToJson(comment);
        if (self.local.template) {
            let div = $('<div class="temp"></div>');
            self.local.template.before(div).remove();
            self.drawSimple();
            div.after(self.local.template).remove();
            self.local.template.trigger('click');
        }
    });
};
/**
 * удаление из списка
 */
Comment.prototype.removeFromList = function () {
    if (this.local.template) {
        this.local.template.remove();
    }
};
/**
 * получим ид операции
 * @returns {*}
 */
Comment.prototype.getOperId = function () {
    return this.local.fields.oper_id;
};
/**
 * лайки
 * @param likes
 */
Comment.prototype.setLikes = function (likes) {
    this.local.likes = likes || {};
};
/**
 * получатели
 * @returns {*}
 */
Comment.prototype.getRecipients = function () {
    try {
        return this.local.fields.email_out.split(',');
    } catch (e) {
        return [];
    }
};