Chat.Window = function () {
    let local = {
        vue: null
    };
    let _users = [];
    let _chats = {};
    let self = {
        initialization: function () {
            self.setUserList();
            self.renderWindow();
            self.setFromStorage();
        },
        renderWindow: function () {
            let template = $('<chat ' +
                'v-bind:users="users" ' +
                'v-bind:chats="chats" ' +
                'v-bind:active="active" ' +
                'v-bind:selected="selected" ' +
                'v-on:select="select" ' +
                'v-on:send="send" ' +
                'v-on:close="close" ' +
                '></chat>').appendTo(Interface.getRightBlock());
            local.vue = new Vue({
                el: template[0],
                data: {
                    users: _users,
                    chats: _chats,
                    active: null,
                    selected: null
                },
                methods: {
                    select: function (id) {
                        if (this.selected == id) {
                            id = null;
                        } else {
                            if (this.chats[id] == null) {
                                this.chats[id] = self.createChatItem(id);
                            }
                            this.chats[id].unread = 0;
                        }
                        this.selected = id;
                        this.active = id;
                        self.saveStorage();
                    },
                    send: function (id) {
                        let message = this.chats[id].message_for_send;
                        if (message.length > 0) {
                            let send = self.sendMessage(id, message);
                            if (send) {
                                this.chats[id].message_for_send = '';
                            }
                            $('#chatarea_' + id, this.$el).select().focus();
                        }
                    },
                    close: function (id) {
                        if (this.chats[id] != null) {
                            this.chats[id] = null;
                            this.selected = null;
                            this.active = null;
                        }
                    },
                    history: function (id) {
                        if (this.chats[id] != null) {
                            let date = this.chats[id].history_date;
                        }
                    }
                }
            });
        },
        setFromStorage: function () {
            let data = Dataset.getCustomStorage('chat');
            if (data) {
                for (let i = 0; i < data.length; i++) {
                    local.vue.chats[data[i]] = self.createChatItem(data[i]);
                }
            }
        },
        saveStorage: function () {
            let array = [];
            for (let id in local.vue.chats) {
                if (local.vue.chats.hasOwnProperty(id)) {
                    if (local.vue.chats[id] != null) {
                        array.push(id);
                    }
                }
            }
            Dataset.setCustomStorage('chat', array);
        },
        createChatItem: function (id) {
            return {
                user: self.getRosterUserById(id),
                message_for_send: '',
                messages: [],
                unread: 0,
                typing: false,
                history_label: 'Загрузить историю',
                history_date: moment().format('DD.MM.YYYY')
            }
        },
        getRosterUserById: function (id) {
            for (let i = 0; i < local.vue.users.length; i++) {
                if (local.vue.users[i].id == id) {
                    return local.vue.users[i];
                }
            }
            return null;
        },
        setUserList: function () {
            let array = List.Users().list();
            for (let i = 0; i < array.length; i++) {
                let user = array[i];
                let id = user.getId();
                if (id != Authorization.getCurrentUser().getId()) {
                    _users.push(new Chat.User(user.vmData));
                    _chats[id] = null;
                }
            }
        },
        responseRoster: function (e, object) {
            let id = Strophe.getNodeFromJid(object.jid);
            let user = this.getRosterUserById(id);
            if (user === null) {
                return false;
            }
            let resource = Strophe.getResourceFromJid(object.jid);
            user._resource(resource, object.status);
            user._status(Object.keys(user.resource).length !== 0);
            // $(document).trigger('chat.window.roster', {i: id, s: _users[id].s});
            return true;
        },
        sendMessage: function (id, message) {
            let message_id = Chat.sendMessage(id, message);
            return self.showMessage(message_id, id, Authorization.getCurrentUser().getId(), message, new Date().getTime());
        },
        showMessage: function (message_id, to, from, text, date, read) {
            let type = '';
            let target = null;
            if (to == Authorization.getCurrentUser().getId()) {
                target = from;
                type = 'in';
            } else {
                target = to;
                type = 'out';
            }
            if (local.vue.chats[target] == null) {
                local.vue.chats[target] = self.createChatItem(target);
            }
            if (self.getMessagesById(target, message_id) == false) {
                local.vue.chats[target].messages.push(new Chat.Message(message_id, to, from, text, date, type, read));
            }
            if (local.vue.active != target) {
                local.vue.chats[target].unread++;
            }
            return true;
        },
        getMessagesById: function (target, message_id) {
            if (typeof local.vue.chats[target] != 'undefined') {
                let messages = local.vue.chats[target].messages;
                for (let i = 0; i < messages.length; i++) {
                    if (messages[i].id == message_id) {
                        return messages[i];
                    }
                }
            }
            return false;
        },
        outMessageDeliveryConfirm: function (target, message_id) {
            let message = self.getMessagesById(target, message_id);
            if (message != false) {
                message.unread = false;
            }
        },
        userTyping: function (target, type) {
            if (local.vue.chats[target] != null) {
                local.vue.chats[target].typing = (type + '').toBoolean();
            }
        },
        getAttention: function () {
            let win = window;
            let i = 0;
            let show = ['************', win.document.title];

            function stop() {
                clearInterval(focusTimer);
                win.document.title = show[1];
            }

            win.onfocus = function () {
                stop();
                win.onfocus = null;
            };

            let focusTimer = setInterval(function () {
                if (win.closed) {
                    clearInterval(focusTimer);
                    return;
                }
                win.document.title = show[i++ % 2];
            }, 1000);

            win.focus();
        }
    };
    self.initialization();
    return self;
};