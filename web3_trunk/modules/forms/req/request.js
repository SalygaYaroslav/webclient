/**
 *
 * @param id
 * @param success
 * @returns {*|Boolean}
 */
Request.commentGetCategoryHistory = function (id) {
    return this.sync({
        script: 'get_objectX',
        data: {
            user_login: Authorization.getUserAuthData('login'),
            user_password: Authorization.getUserAuthData('password'),
            object: 'comment_history',
            comment_id: id
        }
    });
};
Request.sendCommentToServer = function (task, data, files, is_email, callback) {
    let project = task.getParentProject();
    let org = project.getParentOrganization();
    let data_to_send = {
        user_login: Authorization.getUserAuthData('login'),
        user_password: Authorization.getUserAuthData('password'),
        target: 'task',
        operation_type: 'update',
        object_id: project.getId(),
        task_id: task.getId(),
        parent_id: '-2'
    };
    let body = {
        guid: Tool.generateGuid(16),
        com_guid: Tool.generateGuid(12),
        iStateID: data.iStateID,
        dtStart: data.dtStart || '30.12.1899 00:00:00',
        dtDeadline: data.dtDeadline || '30.12.1899 00:00:00',
        iRealHours: '00:00',
        created: moment().add(Authorization.timeZone(), 'h').format('YYYY-MM-DD HH:mm:ss'),
        vcFrom: Authorization.getCurrentUser().getLogin(),
        system: Tool.decode(data.system),
        com_header: data.com_header,
        author_id: Authorization.getCurrentUser().getId(),
        author: Authorization.getCurrentUser().getLogin(),
    };
    // org_id
    if (org.getId()) {
        body['org_id'] = org.getId();
    }

    if (is_email) {
        body['email_out'] = data['email_out'];
        body['gatewayID'] = data['gatewayID'];
        body['message'] = data['comment'];
        body['extend'] = '';
        body['send_mail_xml'] = Tool.jsonToXmls(data['send_mail_xml']);
        data_to_send['send_mail'] = data['send_mail'];
        data_to_send['gatewayID'] = data['gatewayID'];
    } else {
        body['comment'] = data['comment'];
        body['addwriters'] = data['addwriters'];
    }
    if (data.vcNeedResponse) {
        body.vcNeedResponse = data.vcNeedResponse;
    } else {
        if (data.vcTo) {
            body.vcTo = data.vcTo;
        } else {
            body.vcTo = '';
        }
    }
    //files list prepared, can form it for send
    if (files != null && Object.keys(files).length > 0) {
        let file_arrays = [];
        let file_links = [];
        let file_crcs = [];
        for (let id in files) {
            if (files.hasOwnProperty(id)) {
                let file = files[id].file.getData();
                file_arrays.push(file.file.size + ';' + file.file.name);
                file_links.push(file.filename);
                file_crcs.push(file.hash);
            }
        }
        body.files = file_arrays.join('\r\n');
        body.filesshown = file_arrays.join('\r\n');
        body.links = file_links.join('\r\n');
        body.files_crc = file_crcs.join('\r\n');
    } else {
        body.files = '';
        body.filesshown = '';
        body.links = '';
        body.files_crc = '';
    }
    data_to_send['body'] = Request.bodyToSend(body);
    return this.async({
        script: 'add_operationX',
        data: data_to_send,
        callback: function (req) {
            let xml = req.xml();
            body['id'] = $('comment', xml).attr('id');
            body['task_id'] = task.getId();
            body['oper_id'] = $('operation', xml).attr('id');
            callback(req, body);
        },
        progress: function () {
        }
    });
};