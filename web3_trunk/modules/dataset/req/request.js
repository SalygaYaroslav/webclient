/**
 * запрос на авторизацию
 * асинхронный запрос
 * @param id последний id
 * @param success калбек
 * @param error калбек
 * @returns {*|Boolean}
 */
Request.getNews = function (id, success) {
    return this.async({
        timeout: false,
        script: 'get_news',
        data: {
            user_login: Authorization.getUserAuthData('login'),
            user_password: Authorization.getUserAuthData('password'),
            web: true,
            last_id: id
        },
        callback: success,
        progress: function () {
        }
    });
};
/**
 * запрос на получение данных по сущности
 * @param type тип сущности
 * @param id ид сущности
 * @returns {*}
 */
Request.getEntity = function (type, id) {
    if (typeof id == 'object') {
        id = id.join(',');
    }
    return this.sync({
        script: 'get_objectX',
        data: {
            user_login: Authorization.getUserAuthData('login'),
            user_password: Authorization.getUserAuthData('password'),
            web: true,
            object: type,
            id: id
        }
    });
};
/**
 *
 * @param login
 * @returns {*}
 */
Request.getUserByLogin = function (login) {
    return this.sync({
        script: 'get_objectX',
        data: {
            user_login: Authorization.getUserAuthData('login'),
            user_password: Authorization.getUserAuthData('password'),
            web: true,
            object: 'user',
            login: login
        }
    });
};
/**
 *
 * @param id
 * @param options
 * @param callback
 * @returns {*}
 */
Request.loadProjectTasks = function (id, options, callback) {
    let object = {
        script: 'get_proj_tasks',
        data: {
            user_login: Authorization.getUserAuthData('login'),
            user_password: Authorization.getUserAuthData('password'),
            web: true,
            id: id,
            fields: 'vcTo,oper_id,progress,dtStart,dtDeadline,dtLastChange,iPriorityID,org_id'
        }
    };
    if (typeof options == 'undefined') {
        options = {};
    }
    if (typeof options.load_contact != 'undefined') {
        object.data.fields += ',xmlContact,ownerid';
    }
    if (typeof options.load_closed != 'undefined') {
        object.data.withClosed += options.load_closed;
    }
    if (typeof callback == 'function') {
        object.callback = callback;
        return this.async(object);
    } else {
        return this.sync(object);
    }
};
/**
 *
 * @param id
 * @param callback
 * @returns {*}
 */
Request.loadOrgProjects = function (id, callback) {
    let object = {
        script: 'get_proj4organX',
        data: {
            user_login: Authorization.getUserAuthData('login'),
            user_password: Authorization.getUserAuthData('password'),
            web: true,
            organ_id: id
        }
    };
    if (typeof callback == 'function') {
        object.callback = callback;
        return this.async(object);
    } else {
        return this.sync(object);
    }
};
Request.getRouters = function (org_id, callback) {
    let object = {
        script: 'get_objectX',
        data: {
            user_login: Authorization.getUserAuthData('login'),
            user_password: Authorization.getUserAuthData('password'),
            web: true,
            object: 'org_mailgateways',
            id: org_id
        }
    };
    if (typeof callback == 'function') {
        object.callback = callback;
        return this.async(object);
    } else {
        return this.sync(object);
    }
};
Request.saveTaskGatewaySettings = function (task, callback) {
    let object = {
        script: 'add_operationX',
        data: {
            user_login: Authorization.getUserAuthData('login'),
            user_password: Authorization.getUserAuthData('password'),
            object_id: task.getParentProject().getId(),
            task_id: task.getId(),
            parent_id: task.getEntityField('parentid'),
            operation_type: 'update',
            target: 'task',
            body: function () {
                return Request.bodyToSend({'gateway_send_settings': task.getEntityField('gateway_send_settings')});
            }()
        }
    };
    if (typeof callback == 'function') {
        object.callback = callback;
        return this.async(object);
    } else {
        return this.sync(object);
    }
};
Request.updateUser = function (user, fields, callback) {
    let object = {
        script: 'add_operationX',
        data: {
            user_login: Authorization.getUserAuthData('login'),
            user_password: Authorization.getUserAuthData('password'),
            object_id: user.getId(),
            target: 'user',
            operation_type: 'update',
            body: function () {
                return Request.bodyToSend($.extend(fields, {vcLogin: user.getLogin()}));
            }()
        }
    };
    if (typeof callback == 'function') {
        object.callback = callback;
        return this.async(object);
    } else {
        return this.sync(object);
    }
};