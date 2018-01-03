/**
 * измененин категории коммента
 * @param comment
 * @param success
 * @returns {*|Boolean}
 */
Request.commentCategoryEdit = function (comment, category_id, success) {
    let task = comment.getParentTask();
    let project = task.getParentProject();
    return this.async({
        timeout: false,
        script: 'add_operationX',
        data: {
            user_login: Authorization.getUserAuthData('login'),
            user_password: Authorization.getUserAuthData('password'),
            target: 'task',
            operation_type: 'update',
            task_id: task.getId(),
            object_id: project.getId(),
            parent_id: -2,
            last_guid: Number(new Date()) + Dataset.storage.time_delay,
            web: true,
            body: Request.bodyToSend({
                project_id: project.getId(),
                update_comment_cat: 1,
                hashes: '',
                ids: comment.getId(),
                cat_id: category_id,
                ['com_header_' + comment.getId()]: function () {
                    let date = moment().format('DD.MM.YYYY  HH:mm');
                    let old_header = comment.getComHeader(true);
                    //если в com_header уже была запись о смене категории, удаляем ее
                    if (old_header) {
                        old_header = old_header.replace(new RegExp('<category_changed.+/>', 'g'), '');
                        //добавляем новую запись о смене категории
                        old_header = old_header.replace(new RegExp('</comment_header>', 'g'), '<category_changed author="' + Authorization.getCurrentUser().getId() + '" date="' + date + '"/></comment_header>');
                    } else {
                        old_header = '<comment_header><category_changed author="' + Authorization.getCurrentUser().getId() + '" date="' + date + '"/></comment_header>'
                    }
                    return old_header;
                }()
            })
        },
        callback: success,
        progress: function () {
        }
    });
};
/**
 *
 * @param comment
 * @param id
 * @param copy
 * @param callback
 * @returns {*|Boolean}
 */
Request.commentMoveToOtherTask = function (comment, id, copy, callback) {
    let task = comment.getParentTask();
    return this.async({
        script: 'add_operationX',
        data: {
            user_login: Authorization.getUserAuthData('login'),
            user_password: Authorization.getUserAuthData('password'),
            target: 'task',
            operation_type: 'update',
            object_id: task.getParentProject().getId(),
            task_id: id,
            body: Request.bodyToSend({
                commove: comment.getId(),
                copy: copy ? 'true' : 'false',
                move: 'true'
            })
        },
        callback: callback,
        progress: function () {
        }
    });
};
/**
 *
 * @param comment
 * @param is_favorite
 * @param callback
 * @returns {*|Boolean}
 */
Request.commentChangeFavorite = function (comment, is_favorite, callback) {
    let task = comment.getParentTask();
    return this.async({
        script: 'add_operationX',
        data: {
            user_login: Authorization.getUserAuthData('login'),
            user_password: Authorization.getUserAuthData('password'),
            operation_type: 'update',
            target: 'task',
            parent_id: '-2',
            object_id: task.getParentProject().getId(),
            task_id: task.getId(),
            last_comment_id: comment.getId(),
            body: Request.bodyToSend({
                com_update: comment.getId(),
                is_favorite: is_favorite
            })
        },
        callback: callback,
        progress: function () {
        }
    });
};
/**
 *
 * @param comment
 * @param vote_result
 * @param callback
 * @param own_id
 * @returns {*|Boolean}
 */
Request.commentLike = function (comment, vote_result, callback, own_id) {
    let task = comment.getParentTask();
    let data = {
        script: 'add_operationX',
        data: {
            user_login: Authorization.getUserAuthData('login'),
            user_password: Authorization.getUserAuthData('password'),
            operation_type: own_id ? 'update' : 'create',
            target: 'comvote',
            body: Request.bodyToSend({
                result: vote_result,
                comment_id: comment.getId()
            })
        },
        callback: callback,
        progress: function () {
        }
    };
    if (own_id) {
        data.data.object_id = own_id;
    } else {
        data.data.task_id = task.getId();
    }
    return this.async(data);
};
