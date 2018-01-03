/**
 * пустая сцена
 * @type {Function}
 */
Scene.empty = (function (template, params) {
    /** private */

    /** public */
    return {
        /**
         * инициализация
         * @returns {void|*}
         */
        init: function () {
            return template.append(Template.render('scene', 'empty_scene'));
        },
        /**
         * перезагрузка
         */
        reload: function () {
        },
        /**
         * снятие калбеков
         * @param callback
         * @returns {*}
         */
        unbindScene: function (callback) {
            return callback();
        }
    };
});