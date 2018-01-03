/**
 * запрос на авторизацию
 * асинхронный запрос
 * @param login - логин
 * @param password - пароль с хешем без %
 * @param success - калбек
 * @param error - калбек
 * @returns {*}
 */
Request.auth = function (login, password, success) {
    return Request.async({
        script: 'loginX',
        data: {
            user_login: login,
            user_passwd: password,
            web: true
        },
        callback: success,
        progress: function () {
        }
    });
};