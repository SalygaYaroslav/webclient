/**
 * модуль сцен
 * @type {{changeScene, appendScene, eraseOldScene, changeParam, getScene, getSceneObject, getSceneName, contacts, empty, projects, users, crm}}
 */
var Scene = (function () {
    /** private */
    let scene = null;
    let work = {
        current_name: null,
        current_param: null,
        current_object: null,
        param: null
    };
    /** public */
    return {
        /**
         * смена сцены
         * @param {string} scene_name название сцены
         * @param {array} param параметры
         */
        changeScene: function (scene_name, param) {
            let self = this;
            Interface.setActiveNavigate(scene_name);
            self.eraseOldScene(function () {
                let name = work.current_name = scene_name;
                work.param = param;
                work.current_object = null;
                if (typeof Scene[name] == 'undefined') {
                    Prostoy.appendScene(name, function () {
                        self.appendScene(name, param);
                    }, function () {
                        Prostoy.appendScene('empty', function () {
                            self.appendScene('empty', param);
                        });
                    });
                } else {
                    self.appendScene(name, param);
                }
            });
        },
        /**
         * инициализация сцены
         * @param name
         * @param param
         * @returns {*}
         */
        appendScene: function (name, param) {
            work.current_object = new Scene[name](this.getScene().empty(), param);
            // init
            return work.current_object.init();
        },
        /**
         * очистим сцену от старых биндов и тд
         * @param callback
         */
        eraseOldScene: function (callback) {
            $('#webapp > #trash', 'body').empty();
            if (typeof callback == 'undefined') {
                callback = function () {
                };
            }
            // проверим, есть ли объект
            if (work.current_object != null) {
                // проверим, есть ли функция
                if (typeof work.current_object.unbindScene == 'function') {
                    work.current_object.unbindScene(function () {
                        // очистим кнопки
                        BBlock.clear();
                        callback();
                    });
                } else {
                    callback();
                }
            } else {
                callback();
            }
        },
        /**
         * смена параметров в url\сцене
         * @param scene_name название сцены
         * @param param параметры
         */
        changeParam: function (scene_name, param) {
            if (work.current_name != scene_name) {
                return changeScene(scene_name, param);
            }
            work.param = param;
            // запустим инициализацию
            if (work.current_object != null && typeof work.current_object.changeParams == 'function') {
                work.current_object.changeParams(work.param);
            }
        },
        /**
         * вернем объект html сцены
         * @returns {*} сцена
         */
        getScene: function () {
            if (scene == null) {
                scene = $('body').find('#webscene').eq(0);
            }
            return scene;
        },
        /**
         * вернем объект сцены
         * @returns {*}
         */
        getSceneObject: function () {
            return work.current_object;
        },
        /**
         * вернем название сцены
         * @returns {string}
         */
        getSceneName: function () {
            return work.current_name;
        }
    };
})();