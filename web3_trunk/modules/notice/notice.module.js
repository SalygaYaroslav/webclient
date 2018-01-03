/**
 * модуль уведомлений
 * @type {{error, notify, confirm, modal}}
 */
Notice = (function () {
    /**constructor **/
    /** public **/
    return {
        /**
         * уведомление об ошибке
         * @param text
         */
        error: function (text) {
            new jBox('Notice', {
                attributes: {
                    x: 'right',
                    y: 'bottom'
                },
                content: text,
                color: 'red',
                appendTo: '#notification-container'
            });
        },
        /**
         * уведомление
         * @param text
         */
        notify: function (text) {
            new jBox('Notice', {
                attributes: {
                    x: 'right',
                    y: 'bottom'
                },
                content: text,
                color: 'blue',
                appendTo: '#notification-container'
            });
        },
        /**
         * модальный конфирм
         * @param text
         * @param confirm_button
         * @param cancel_button
         * @param confirm
         * @param cancel
         */
        confirm: function (text, confirm_button, cancel_button, confirm, cancel) {
            new jBox('Confirm', {
                content: text,
                confirmButton: confirm_button,
                cancelButton: cancel_button,
                confirm: confirm,
                cancel: cancel,
                appendTo: '#notification-container'
            }).open();
        },
        /**
         *
         * @param title
         * @param content
         */
        modal: function (title, content, callback) {
            new jBox('Modal', {
                title: title,
                content: content,
                onClose: callback,
                appendTo: '#notification-container'
            }).open();
        }
    }
})();