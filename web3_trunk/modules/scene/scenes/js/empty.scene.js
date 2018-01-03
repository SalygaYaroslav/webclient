/**
 * ������ �����
 * @type {Function}
 */
Scene.empty = (function (template, params) {
    /** private */

    /** public */
    return {
        /**
         * �������������
         * @returns {void|*}
         */
        init: function () {
            return template.append(Template.render('scene', 'empty_scene'));
        },
        /**
         * ������������
         */
        reload: function () {
        },
        /**
         * ������ ��������
         * @param callback
         * @returns {*}
         */
        unbindScene: function (callback) {
            return callback();
        }
    };
});