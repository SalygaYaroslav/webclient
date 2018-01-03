/**
 *
 * @returns {*}
 * @constructor
 */
var Comments = function () {
    /** private */
    let local = {};

    /** constructor */

    /** public */
    return {
        parseComHeader: function (com_header) {
            let lang = Lang.get()['comment']['com_header'];
            if (!com_header)
                return '';
            let xml_header = $(com_header);
            // что есть в этом комменте и чего нет
            let email_out = false;
            let result_array = [];

            //Отправлен email
            if ($('mail_sent', xml_header).length > 0) {
                email_out = true;
                let theme = $('mail_sent', xml_header).attr('theme');
                let recipients = $('mail_sent', xml_header).attr('recipients');
                result_array.push(lang['mail'] + ': ' + ((theme.trim()) ? theme.trim() : lang['mail_has_not_theme']) + ', ' + recipients);
            }

            //Назначение задачи
            if (!email_out && $('task_appointed', xml_header).length > 0) {
                let user = Dataset.Tree.getUserByLogin($('task_appointed', xml_header).attr('login'));
                if (user) {
                    result_array.push(lang['vc_to'] + ': ' + user.getName());
                }
            }
            //Снято назначение задачи
            if (!email_out && $('task_appoint_reset', xml_header).length > 0) {
                result_array.push(lang['vc_to_null']);
            }
            //Дедлайн задачи
            if (!email_out && $('task_deadline', xml_header).length > 0) {
                let oaDate = $('task_deadline', xml_header).attr('datetime').replace(',', '.');
                let date = new Date();
                date.setTime((parseFloat(oaDate) - 25569) * 24 * 3600 * 1000);
                result_array.push(lang['change_date'] + ': ' + moment.utc(date).calendar());
            }
            //Персональный комментарий
            if (!email_out && $('comment_added_personal', xml_header).length > 0) {
                let loginsList = $('comment_added_personal', xml_header).attr('login').split(',');
                let userNamesList = [];
                // прохожим по массиву логинов, чтобы узнать имена пользователей
                for (let i = 0; i < loginsList.length; i++) {
                    if ($.trim(loginsList[i]) != '') {
                        let user = Dataset.Tree.getUserByLogin(loginsList[i]);
                        if (user) {
                            userNamesList.push(user.getName());
                        }
                    }
                }
                result_array.push(lang['personal_for_user'] + ': ' + userNamesList.join(', '));
            }
            // //Звонки
            // if (!isEmailOut && $("call_incoming", xml_header).length > 0) {
            //     let incomingCalll = self._getObject().fields.system;
            //     isIncomingCall = true;
            // }
            // if (!isEmailOut && $("call_outgoing", xml_header).length > 0) {
            //     let outgoingCall = self._getObject().fields.system;
            //     isOutgoingCall = true;
            // }
            //Оповещения
            if ($('comment_notification', xml_header).length > 0) {
                let loginsList = $('comment_notification', xml_header).attr('login').split(',');
                let userNamesList = [];
                // прохожим по массиву логинов, чтобы узнать имена пользователей
                for (let i = 0; i < loginsList.length; i++) {
                    if ($.trim(loginsList[i]) != '') {
                        let user = Dataset.Tree.getUserByLogin(loginsList[i]);
                        if (user) {
                            userNamesList.push(user.getName());
                        }
                    }
                }
                result_array.push(lang['notify_send'] + ': ' + userNamesList.join(', '));
            }
            //Нужен отклик
            if (!email_out && $('response_needed', xml_header).length > 0) {
                let of_whom = $('response_needed', xml_header).attr('of_whom_login');
                let user = Dataset.Tree.getUserByLogin(of_whom);
                if (user) {
                    let userName = user.getName();
                    if (!userName)
                        userName = lang['without'];
                    result_array.push(lang['need_response'] + ' ' + userName);
                }
            }
            // //Поменялся статус задачи
            // //(*бывают статусы: Назначена, Подтверждена, Отработана, Выполнена, Отложена, Отменена)
            // if (!email_out && $('task_state_changed', xml_header).length > 0) {
            //     let stateText = '';
            //     switch ($('task_state_changed', xml_header).text()) {
            //         case "&LANG_APPOINTED":
            //             stateText = "Назначена";
            //             break;
            //         case "&LANG_CONFIRMED":
            //             stateText = "Подтверждена";
            //             break;
            //         case "&LANG_WORKED":
            //             stateText = "Отработана";
            //             break;
            //         case "&LANG_FINISHED":
            //             stateText = "Выполнена";
            //             break;
            //         case "&LANG_DELAYED":
            //             stateText = "Отложена";
            //             break;
            //         case "&LANG_CANCELED":
            //             stateText = "Отменена";
            //             break;
            //     }
            //     result_array.push('Назначен статус задачи "' + stateText + '"');
            // }
            //Если просто: Добавлен комментарий
            if (!email_out && $('comment_added', xml_header).length > 0 && result_array.length == 0) {
                result_array.push(lang['comment_added']);
            }
            return result_array.join('\r\n');
        }
    };
}();