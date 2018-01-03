/**
 *
 * @param id
 * @param success
 * @returns {*|Boolean}
 */
Request.getCommentById = function (id, success) {
    if (typeof id == 'object') {
        id = id.join(',');
    }
    return this.async({
        script: 'get_objectX',
        data: {
            user_login: Authorization.getUserAuthData('login'),
            user_password: Authorization.getUserAuthData('password'),
            web: true,
            object: 'comment',
            id: id
        },
        callback: success
    });
};