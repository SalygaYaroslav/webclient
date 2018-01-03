/**
 * ������ ����
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
         * ����� �����
         * @param {string} scene_name �������� �����
         * @param {array} param ���������
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
         * ������������� �����
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
         * ������� ����� �� ������ ������ � ��
         * @param callback
         */
        eraseOldScene: function (callback) {
            $('#webapp > #trash', 'body').empty();
            if (typeof callback == 'undefined') {
                callback = function () {
                };
            }
            // ��������, ���� �� ������
            if (work.current_object != null) {
                // ��������, ���� �� �������
                if (typeof work.current_object.unbindScene == 'function') {
                    work.current_object.unbindScene(function () {
                        // ������� ������
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
         * ����� ���������� � url\�����
         * @param scene_name �������� �����
         * @param param ���������
         */
        changeParam: function (scene_name, param) {
            if (work.current_name != scene_name) {
                return changeScene(scene_name, param);
            }
            work.param = param;
            // �������� �������������
            if (work.current_object != null && typeof work.current_object.changeParams == 'function') {
                work.current_object.changeParams(work.param);
            }
        },
        /**
         * ������ ������ html �����
         * @returns {*} �����
         */
        getScene: function () {
            if (scene == null) {
                scene = $('body').find('#webscene').eq(0);
            }
            return scene;
        },
        /**
         * ������ ������ �����
         * @returns {*}
         */
        getSceneObject: function () {
            return work.current_object;
        },
        /**
         * ������ �������� �����
         * @returns {string}
         */
        getSceneName: function () {
            return work.current_name;
        }
    };
})();