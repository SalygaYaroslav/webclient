Request.getCrms = function (org_id, callback) {
    let object = {
        script: 'get_objectX',
        data: {
            user_login: Authorization.getUserAuthData('login'),
            user_password: Authorization.getUserAuthData('password'),
            web: true,
            no_crm_data: true,
            object: 'get_crm_list',
            org_id: org_id
        }
    };
    if (typeof callback == 'function') {
        object.callback = callback;
        return this.async(object);
    } else {
        return this.sync(object);
    }
};
Request.getCrmStructure = function (id, callback) {
    let object = {
        script: 'get_objectX',
        data: {
            user_login: Authorization.getUserAuthData('login'),
            user_password: Authorization.getUserAuthData('password'),
            web: true,
            no_crm_data: true,
            object: 'get_crm',
            lookup: true,
            id: id
        }
    };
    if (typeof callback == 'function') {
        object.callback = callback;
        return this.async(object);
    } else {
        return this.sync(object);
    }
};
Request.getCrmData = function (params, callback) {
    let object = {
        script: 'get_crm_object_web',
        data: {
            user_login: Authorization.getUserAuthData('login'),
            user_password: Authorization.getUserAuthData('password'),
            web: true,
            lookup: true,
            ids: params.id + ':' + params.limit + '-' + params.start,
            order: params.field + ':' + params.order
        }
    };
    if (params.filter) {
        object.data.filter = params.filter;
    }
    if (params.searchdata) {
        object.data.searchdata = params.searchdata;
    }
    if (typeof callback == 'function') {
        object.callback = callback;
        return this.async(object);
    } else {
        return this.sync(object);
    }
};
Request.removeCrmRecords = function (params, callback) {
    let object = {
        script: 'add_operationX',
        data: {
            user_login: Authorization.getUserAuthData('login'),
            user_password: Authorization.getUserAuthData('password'),
            target: 'crmobject',
            operation_type: 'delete',
            last_guid: Tool.generateGuid(10)
        }
    };
    if (params.task_id && params.object_id) {
        object.data.task_id = params.task_id;
        object.data.object_id = params.object_id;
    } else {
        object.data.crmstructure_id = params.task_id;
    }
    object.data.body = Request.bodyToSend(params.body);
    if (typeof callback == 'function') {
        object.callback = callback;
        return this.async(object);
    } else {
        return this.sync(object);
    }
};
Request.saveCrmRecords = function (params, callback) {
    let object = {
        script: 'add_operationX',
        data: {
            user_login: Authorization.getUserAuthData('login'),
            user_password: Authorization.getUserAuthData('password'),
            target: 'crmobject',
            operation_type: params.operation_type,
            last_guid: Tool.generateGuid(10)
        }
    };
    if (params.task_id && params.object_id) {
        object.data.task_id = params.task_id;
        object.data.object_id = params.object_id;
    } else {
        object.data.crmstructure_id = params.task_id;
    }
    object.data.body = Request.bodyToSend(params.body);
    if (typeof callback == 'function') {
        object.callback = callback;
        return this.async(object);
    } else {
        return this.sync(object);
    }
};