/**
 *
 * @param task_id
 * @param last_comm_id
 * @param success
 * @returns {*|Boolean}
 */
Request.getCommentsByTaskId = function (task_id, last_comm_id, max_count, success) {
    return Request.async({
        script: 'get_task_com',
        data: {
            user_login: Authorization.getUserAuthData('login'),
            user_password: Authorization.getUserAuthData('password'),
            max_comments: max_count,
            ids: task_id + ':' + last_comm_id,
            reverse: true,
            mobile: true,
            inverse_order_response: true
        },
        callback: success,
        progress: function () {
        }
    });
};
/**
 *
 * @param task_id
 * @param oper_id
 * @param success
 * @returns {*|Boolean}
 */
Request.checkCommentsUpdate = function (task_id, oper_id, success) {
    return Request.async({
        script: 'get_task_com',
        data: {
            user_login: Authorization.getUserAuthData('login'),
            user_password: Authorization.getUserAuthData('password'),
            ids: task_id + ':' + oper_id,
            web: true
        },
        callback: success,
        progress: function () {
        }
    });
};
/**
 *
 * @param task_id
 * @returns {*}
 */
Request.getTaskLikes = function (task_id) {
    return Request.sync({
        script: 'get_objectX',
        data: {
            user_login: Authorization.getUserAuthData('login'),
            user_password: Authorization.getUserAuthData('password'),
            object: 'comvotes',
            id: task_id
        },
        progress: function () {
        }
    });
};
/**
 *
 * @param data
 * @param callback
 * @returns {*|Boolean}
 */
Request.findComments = function (data, callback) {
    let object = {
        user_login: Authorization.getUserAuthData('login'),
        user_password: Authorization.getUserAuthData('password'),
        object: 'comment'
    };
    for (let id in data) {
        if (data.hasOwnProperty(id)) {
            object[id] = data[id];
        }
    }
    return Request.async({
        script: 'searchX',
        data: object,
        callback: callback,
        progress: function () {
        }
    });
};