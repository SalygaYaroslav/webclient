/**
 *
 * @type {{appendJs, loadJs, appendCss, loadCss, load, appendConfiguration, appendScene}}
 */
var Prostoy = (function () {
    /** private */
    let configs = {
        on_load: __web__.onload,
        on_start: __web__.onstart,
        version: '?' + __web__.version
    };
    /** public */
    return {
        /**
         * добавим js
         * @param array
         * @param success
         * @param error
         * @returns {*}
         */
        appendJs: function (array, success, error) {
            let self = this;
            if (array.length == 0) {
                return success();
            }
            self.loadJs(array[0], function () {
                array.splice(0, 1);
                self.appendJs(array, success, error);
            }, error);
        },
        /**
         * грузим js
         * @param src
         * @param onload
         * @param onerror
         */
        loadJs: function (src, onload, onerror) {
            let script = document.createElement('script');
            script.src = src;
            script.async = false;
            script.onload = onload || function (e) {
                console.log(e);
            };
            script.onerror = onerror || function (e) {
                console.log(e);
            };
            document.head.appendChild(script);
        },
        /**
         * добавим css
         * @param array
         * @param callback
         * @returns {*}
         */
        appendCss: function (array, callback) {
            let self = this;
            if (array.length == 0) {
                return callback();
            }
            self.loadCss(array[0], function () {
                array.splice(0, 1);
                self.appendCss(array, callback);
            });
        },
        /**
         * грузим css
         * @param href
         * @param onload
         */
        loadCss: function (href, onload) {
            let head = document.getElementsByTagName('head')[0];
            let link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.media = 'all';
            link.href = href;
            link.onload = onload;
            head.appendChild(link);
        },
        /**
         * начинаем работу приложения
         * @param {function} callback - калбек
         */
        load: function (callback) {
            let self = this;
            // применим конфиг для загрузки
            self.appendConfiguration(configs.on_load, function () {
                /** append spy to change hash */
                $(window).on('hashchange', function () {
                    Router.spy();
                });
                callback();
                Lang.loadConfig(function () {
                    // стартуем авторизацию
                    Authorization.init(function () {
                        // применим конфиг для работы
                        self.appendConfiguration(configs.on_start, function () {
                            setTimeout(function () {
                                // строим каркас приложения
                                Interface.renderCarcase();
                                // блок с кнопками
                                BBlock.initialization();
                                // TODO test indexDB
                                Database.init(function () {
                                    // инициализция хранилища
                                    Dataset.init(function (last_id) {
                                        window.setTimeout(function () {
                                            // проверим, если это 1 синхронизация,
                                            // то получим новости и построим блок организации.
                                            // иначе - строим блок и получаем новости
                                            if (last_id != '0') {
                                                // строим блок
                                                Interface.renderOrganizationBlock();
                                                // строим блок
                                                Interface.renderUserBlock();
                                                // сразу запустим шпиона
                                                Router.spy();
                                                // получим новости
                                                Dataset.checkNews();
                                                // другие сервисы
                                                self.startOtherServices();
                                            } else {
                                                Interface.Load.show('Инициализация приложения');
                                                // полная синхронизация
                                                Dataset.checkNews(function () {
                                                    Dataset.loadTasks(function () {
                                                        Interface.Load.hide();
                                                        // строим блок
                                                        Interface.renderOrganizationBlock();
                                                        // строим блок
                                                        Interface.renderUserBlock();
                                                        // сразу запустим шпиона
                                                        Router.spy();
                                                        // другие сервисы
                                                        self.startOtherServices();
                                                    });
                                                });
                                            }
                                        }, 100);
                                    });
                                });
                            }, 1000);
                        });
                    });
                });
            });
        },
        /**
         * применяем конфиг
         * подготовим массив с данными для загрузки
         * @param {object} configuration объект с конфигом
         * @param {function} callback_ - калбек функция
         * @returns {function} appendJs
         */
        appendConfiguration: function (configuration, callback_) {
            let self = this;
            // build list of script
            let js_ = [];
            let css_ = [];
            for (let id in configuration) {
                js_.push('/modules/' + id + '/' + id + '.module.js' + configs.version);
                if (typeof configuration[id].ext != 'undefined') {
                    for (let i = 0; i < configuration[id].ext.length; i++) {
                        js_.push('/modules/' + id + '/ext/' + configuration[id].ext[i] + '.ext.js' + configs.version);
                    }
                }
                if (typeof configuration[id].cls != 'undefined') {
                    for (let i = 0; i < configuration[id].cls.length; i++) {
                        js_.push('/modules/' + id + '/cls/' + configuration[id].cls[i] + '.class.js' + configs.version);
                    }
                }
                if (typeof configuration[id].js != 'undefined') {
                    for (let i = 0; i < configuration[id].js.length; i++) {
                        js_.push('/modules/' + id + '/js/' + configuration[id].js[i] + '.js' + configs.version);
                    }
                }
                if (typeof configuration[id].req != 'undefined' && configuration[id].req == true) {
                    js_.push('/modules/' + id + '/req/request.js' + configs.version);
                }
                if (typeof configuration[id].css != 'undefined') {
                    for (let j = 0; j < configuration[id].css.length; j++) {
                        css_.push('/modules/' + id + '/_css/' + configuration[id].css[j] + '.css' + configs.version);
                    }
                }
            }
            return self.appendJs(js_, function () {
                self.appendCss(css_, callback_);
            });
        },
        /**
         * добавим сцену
         * @param scene_name
         * @param success_
         * @param error_
         * @returns {*}
         */
        appendScene: function (scene_name, success_, error_) {
            let self = this;
            let js_url = '/modules/scene/scenes/js/' + scene_name + '.scene.js' + configs.version;
            let css_url = '/modules/scene/scenes/_css/' + scene_name + '.css' + configs.version;
            return self.appendJs([js_url], function () {
                self.appendCss([css_url], success_);
            }, error_);
        },
        startOtherServices: function () {
            // chat start
            Chat.initialization();
        }
    };
})();