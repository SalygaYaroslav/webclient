window.Chat = (function () {
    let local = {
        personal_data: {
            id: null,
            password: null
        },
        server_data: {
            http_bind: '/php/chat.php',
            resource: 'web3',
            domain: '',
            server: '',
        },
        chat: {
            state: false,
            window: null,
            domain: null,
            ping: 60 * 1000,
            timeout: 1000
        }
    };
    let _connection = null;
    let _detaching = false;
    let _states = {
        'ERROR': 0,
        'CONNECTING': 1,
        'CONNFAIL': 2,
        'AUTHENTICATING': 3,
        'AUTHFAIL': 4,
        'CONNECTED': 5,
        'DISCONNECTED': 6,
        'DISCONNECTING': 7,
        'ATTACHED': 8
    };

    let self = {
        _window: function (type) {
            if (typeof type != 'undefined') {
                local.chat.window = type;
            } else {
                return local.chat.window;
            }
        },
        initialization: function () {
            // инициализация только тут
            local.personal_data.id = Authorization.getCurrentUser().getId();
            local.personal_data.password = Authorization.getUserAuthData('password');
            local.server_data.domain = Authorization.getJabberConnectionData('domain');
            local.server_data.server = Authorization.getJabberConnectionData('server');
            self.setTriggers();
            self.plugin();
            local.chat.window = new Chat.Window();
            // let personal_status = (Authorization.personalWebConfig('chat') + '').toBoolean();
            // if (personal_status === false) {
            //     // disabled
            // } else {
            //     self.plugin();
            // }
        },
        setTriggers: function () {
            $(document).off('composing.chatstates').on('composing.chatstates', function (a, b, c) {
                console.log('composing', a, b, c);
            });
            $(document).off('paused.chatstates').on('paused.chatstates', function (a, b, c) {
                console.log('paused', a, b, c);
            });
            $(document).off('active.chatstates').on('active.chatstates', function (a, b, c) {
                console.log('active', a, b, c);
            });
            $(document).off('roster.chatstates').on('roster.chatstates', function (e, object) {
                self.responseRoster(e, object);
            });
            $(document).off('old.chatstates').on('old.chatstates', self.responseOldMessage);
            $(document).off('fin.chatstates').on('fin.chatstates', self.responseOldMessage);
            // $(document).off('incoming.receipts').on('incoming.receipts', self.message);
            // $(document).off('delivery.receipts').on('delivery.receipts', self.delivery);
            // $(document).off('chat.window.roster').on('chat.window.roster', function (e, obj) {
            //     _private.rdw.users_list.find('#' + obj.i).find('.chat-u-s').attr('status', obj.s);
            //     // удаляем уведомление если юзер вышел
            //     if (obj.s == false) {
            //         _private.rdw.users_list.find('#' + obj.i).removeClass('type');
            //     }
            // });
        },
        plugin: function () {
            _connection = new Strophe.Connection(local.server_data.http_bind);
            if (_connection !== null) {
                _connection.sync = false;
            }
            _connection.connect(local.personal_data.id + '@' + local.server_data.domain + '/' + local.server_data.resource,
                local.personal_data.password, self.onChangeStatus);
        },
        onChangeStatus: function (state, error) {
            switch (state) {
                case _states['ERROR']:
                    console.error('CONNECTION ERROR: ' + error);
                    break;
                case _states['CONNECTING']:
                    console.info('CONNECTING as ' + _connection.jid + '/' + _connection.pass);
                    break;
                case _states['CONNFAIL']:
                    console.error('CONNECTION as ' + _connection.jid + ' FAILED BECAUSE: ', error);
                    break;
                case _states['AUTHENTICATING']:
                    console.info('AUTHENTICATING');
                    break;
                case _states['AUTHFAIL']:
                    console.error('AUTHENTICATION as ' + _connection.jid + ' FAILED: ', error);
                    break;
                case _states['CONNECTED']:
                    self.detaching();
                    self.addDefaultXmppHandlers();
                    break;
                case _states['DISCONNECTED']:
                    break;
                case _states['DISCONNECTING']:
                    break;
                case _states['ATTACHED']:
                    break;
            }
        },
        detaching: function () {
            _detaching = false;
            let unload = function () {
                if (_detaching == false) {
                    _connection.sync = true;
                    // надо сделать выход из групп
                    _connection.flush();
                    _detaching = true;
                }
            };
            $(window).off('unload').on('unload', unload);
            $(window).unbind('beforeunload').bind('beforeunload', unload);
        },
        addDefaultXmppHandlers: function () {
            self.sendToServerAboutAvailable();
            self.addPing();
            self.addErrorStanzaHandler(function (error, text) {
                console.error('au XMPP ERROR: ', text, error);
                return true;
            });
            self.addConferenceHandler();
        },
        sendToServerAboutAvailable: function () {
            _connection.send($pres().c('priority').t('30').up().c('status').t('Available for Chat.').tree());
        },
        addPing: function () {
            _connection.ping.addPingHandler(function (ping) {
                _connection.ping.pong(ping);
                return true;
            });
            _connection.addTimedHandler(local.chat.ping, function () {
                _connection.ping.ping(_connection.domain, function () {
                }, function () {
                    console.error('XMPP connection seems to have gone away :(');
                    // self._reconnect();
                });
                return true;
            });
        },
        addErrorStanzaHandler: function (handler, type, condition) {
            _connection.addHandler(function (stanza, text) {
                let error = $(stanza).children('error').eq(0);
                if (type && $(error).attr('type') != type) {
                    return true;
                }
                if (condition && $(error).children(condition).length == 0) {
                    return true;
                }
                text = error.children('text').text();
                handler(error, text);
            }, null, null, 'error');
        },
        addConferenceHandler: function () {
            _connection.addHandler(function (msg) {
                let room = $(msg).find('x[xmlns="jabber:x:conference"]').attr('jid');
                let pass = $(msg).find('x[xmlns="jabber:x:conference"]').attr('password');
                console.log(room, pass);
                return true;
            }, 'jabber:x:conference');
            return true;
        },
        responseRoster: function (e, object) {
            local.chat.window.responseRoster(e, object);
        },
        responseOldMessage: function (event, xml) {
            let message = $(xml);
            let xmlns = $('result', message).attr('xmlns');
            let fin = $('fin', message);
            if (fin.length > 0) {
                // TODO draw st msg
            } else if (/urn:xmpp:mam:0/gi.test(xmlns) == false) {
                let target = message.attr('to');
                let message_id = message.find('id:first').text();
                let text = message.find('body:first').text();
                let from = message.attr('from');
                let target_id = Strophe.getNodeFromJid(target);
                let from_id = Strophe.getNodeFromJid(from);
                let subject = message.find('subject').text();
                switch (subject) {
                    case 'chat': // сообщение
                        local.chat.window.showMessage(message_id, target_id, from_id, atob(text).wincode2unicode(), new Date().getTime(), true);
                        Tool.playAudio('/sounds/chat.mp3'); // TODO play sound
                        self.deliveryConfirm(from, target, message_id);
                        self.receipts(from, target, message_id);
                        break;
                    case 'chat-delivery-request':
                        self.deliveryConfirmOnRequest(from, target, $('body', message).text());
                        break;
                    case 'chat-delivery-confirmation':
                        local.chat.window.outMessageDeliveryConfirm(from_id, text);
                        break;
                    case 'chat-typing':
                        local.chat.window.userTyping(from_id, text);
                        break;
                }
            }
        },
        deliveryConfirm: function (to, from, message_id) {
            _connection.send($msg({
                to: to,
                from: from,
                type: 'normal'
            }).c('subject').t('chat-delivery-confirmation').up().c('body').t(message_id).tree());
        },
        receipts: function (to, from, message_id) {
            _connection.send($msg({
                to: to,
                from: from,
                type: 'normal',
                id: message_id
            }).c("received", {xmlns: 'urn:xmpp:receipts'}).tree());
        },
        deliveryConfirmOnRequest: function (to, from, body) {
            _connection.send($msg({
                to: to,
                from: from,
                type: 'normal'
            }).c('subject').t('chat-delivery-request-to-repeat').up().c('body').t(body).tree());
        },
        sendMessage: function (id, text) {
            if (/[^\s]/gi.test(text)) {
                let message = text.replace(/\r\n|\r|\n/g, '<BR/>');
                if (message == '')
                    return false;
                let messageId = Tool.generateGuid(16);
                _connection.send($msg({
                    id: messageId,
                    to: id + '@' + _connection.domain,
                    from: _connection.jid,
                    type: 'normal'
                }).c('save').t('true').up().c('subject').t('chat').up().c('body').t(btoa(message.unicode2wincode())).up().c('id').t(messageId).tree());
                return messageId;
            }
            return true;
        }
    };
    return self;
})();