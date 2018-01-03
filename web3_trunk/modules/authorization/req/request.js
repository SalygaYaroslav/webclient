/**
 * ������ �� �����������
 * ����������� ������
 * @param login - �����
 * @param password - ������ � ����� ��� %
 * @param success - ������
 * @param error - ������
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