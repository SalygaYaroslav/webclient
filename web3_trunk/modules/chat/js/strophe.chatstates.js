/**
 * Chat state notifications (XEP 0085) plugin
 * @see http://xmpp.org/extensions/xep-0085.html
 */
Strophe.addConnectionPlugin('chatstates', {
    init: function (connection) {
        this._connection = connection;
        Strophe.addNamespace('CHATSTATES', 'http://jabber.org/protocol/chatstates');
    },
    statusChanged: function (status) {
        if (status === Strophe.Status.CONNECTED || status === Strophe.Status.ATTACHED) {
            this._connection.addHandler(this._notificationReceived.bind(this), Strophe.NS.CHATSTATES, 'message');
            // add presence Received
            this._connection.addHandler(this._presenceReceived.bind(this), null, 'presence');
            // add without NS
            this._connection.addHandler(this._messageReceived.bind(this), null, 'message');
        }
    },
    addActive: function (message) {
        return message.c('active', {xmlns: Strophe.NS.CHATSTATES}).up();
    },
    _notificationReceived: function (message) {
        var composing = $(message).find('composing'),
                paused = $(message).find('paused'),
                active = $(message).find('active'),
                jid = $(message).attr('from'),
                subject = $(message).find('subject');
        if (composing.length > 0) {
            $(document).trigger('composing.chatstates', jid);
        }
        if (paused.length > 0) {
            $(document).trigger('paused.chatstates', jid);
        }
        if (active.length > 0) {
            $(document).trigger('active.chatstates', jid);
        }
        if (subject.length > 0) {
            $(document).trigger('old.chatstates', message);
        }
        return true;
    },
    _messageReceived: function (message) {
        var subject = $(message).find('subject');
        var fin = $(message).find('fin');
        if (subject.length > 0) {
            $(document).trigger('old.chatstates', message);
        }
        if (fin.length > 0) {
            $(document).trigger('fin.chatstates', message);
        }
        return true;
    },
    // added
    _presenceReceived: function (message) {
        var $msg = $(message);
        var jid = $msg.attr('from');
        var status = true;
        if (typeof $msg.attr('type') != 'undefined' && $msg.attr('type') == 'unavailable') {
            status = false;
        }
        $(document).trigger('roster.chatstates', {jid: jid, status: status});
        return true;
    },
    sendActive: function (jid, type) {
        this._sendNotification(jid, type, 'active');
    },
    sendComposing: function (jid, type) {
        this._sendNotification(jid, type, 'composing');
    },
    sendPaused: function (jid, type) {
        this._sendNotification(jid, type, 'paused');
    },
    _sendNotification: function (jid, type, notification) {
        if (!type)
            type = 'chat';
        this._connection.send($msg({
            to: jid,
            from: this._connection.jid,
            type: type
        }).c(notification, {xmlns: Strophe.NS.CHATSTATES}));
    }
});
