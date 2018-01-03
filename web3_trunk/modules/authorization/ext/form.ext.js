/**
 *
 * @type {{init, forceLogin, success}}
 */
Authorization.Form = (function () {
    /** private */
    let private = {
        body: Interface.getBody()
    };
    /** public */
    return {
        /**
         * форма авторизации
         * @param callback_ калбек функция
         */
        init: function (callback_) {
            let self = this;
            let stop_press = false;
            let body = private.body;
            body.empty();
            let form = $(Template.render('authorization', 'auth')).appendTo(body);
            // links
            let login_ = $('#login', form);
            let password_ = $('#password', form);
            let enter = $('#enter', form);
            let login_error = $('#for_login', form);
            let password_error = $('#for_password', form);
            let enter_error = $('#for_enter', form);
            // user data
            let user_data = Authorization.getUserAuthData();
            // set values
            login_.val(user_data.login);
            password_.val(user_data.password);
            // bind login
            login_.on('keypress', function () {
                login_error.attr('rel', '');
            });
            // bind password
            password_.on('keypress', function () {
                password_error.attr('rel', '');
            });
            let successFunc = function (data) {
                self.success(data);
                callback_();
            };
            let lang = Lang.get()['auth']['form'];
            let errorFunc = function (number) {
                stop_press = false;
                switch (number) {
                    case 1:
                        login_error.attr('rel', lang['enter_login']);
                        break;
                    case 2:
                        password_error.attr('rel', lang['enter_password']);
                        break;
                    case 3:
                        login_error.attr('rel', lang['enter_login']);
                        password_error.attr('rel', lang['enter_password']);
                        break;
                    case 4:
                        enter_error.attr('rel', lang['auth_error']);
                        break;
                }
            };
            // bind enter
            enter.on('click', function (e) {
                e.preventDefault();
                if (stop_press == true) {
                    return false;
                }
                stop_press = true;
                login_error.attr('rel', '');
                password_error.attr('rel', '');
                enter_error.attr('rel', '');
                let login = login_.val();
                let password = password_.val();
                Authorization.getLoginToServer(login, password, successFunc, errorFunc);
            });
            // try login
            stop_press = true;
            let login = login_.val();
            let password = password_.val();
            if (login != '' && password != '') {
                if (/^\%.*/gi.test(password)) {
                    setTimeout(function () {
                        Authorization.getLoginToServer(login, password, successFunc, errorFunc);
                    }, 500);
                } else {
                    stop_press = false;
                }
            } else {
                stop_press = false;
            }
        },
        /**
         *
         * @param login
         * @param password
         * @param callback
         */
        forceLogin: function (login, password, callback) {
            let body = private.body;
            body.empty();
            Authorization.getLoginToServer(login, password, function (data) {
                $(Template.render('authorization', 'auth')).appendTo(body);
                Authorization.Form.success(data);
                callback();
            }, function () {
                Authorization.Form.init(callback);
            });
        },
        /**
         * если авторизация успешна
         * @param data данные по авторизации
         */
        success: function (data) {
            $('#authorization', private.body).addClass('success');
            $('.auth-wellcome-title', private.body).html(Lang.get()['auth']['form']['welcome']);
            $('.auth-wellcome-name', private.body).html(data.user_name);
            $('.auth-wellcome-avatar', private.body).css('background-image', 'url("http://' + __web__.file_url + '/' + data.avatar + '")');
        }
    };
})();