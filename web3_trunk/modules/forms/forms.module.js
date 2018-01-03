/**
 * Comment, Category, CommentMove, CommentParticipants, SendMailParams
 */
var Forms = (function () {
    /** private */
    let local = {
        send_mail_params: {}
    };
    /** constructor */
    let self = {
        localMailParams: function (task, params) {
            if (typeof params != 'undefined') {
                if (params == 'delete') {
                    if (typeof local.send_mail_params[task.getId()] != 'undefined') {
                        delete  local.send_mail_params[task.getId()];
                    }
                } else {
                    local.send_mail_params[task.getId()] = params;
                }
                Dataset.setCustomStorage('mail_params_forms', local.send_mail_params);
            } else {
                if (typeof local.send_mail_params[task.getId()] != 'undefined') {
                    return local.send_mail_params[task.getId()];
                } else {
                    return false;
                }
            }
        },
        getStorageMailParams: function () {
            local.send_mail_params = Dataset.getCustomStorage('mail_params_forms') || {};
        },
    };
    self.getStorageMailParams();
    /** public */
    return self;
})();