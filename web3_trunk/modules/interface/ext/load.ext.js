/**
 * экран загрузки
 * @type {{show, hide}}
 */
Interface.Load = (function () {
    /** local */
    let local = {
        load: null
    };
    /** public */
    return {
        /**
         * покажем
         * @param text
         */
        show: function (text, block) {
            if (typeof block == 'undefined') {
                block = $('body');
            }
            if (local.load == null) {
                local.load = $(Template.render('interface', 'load')).appendTo(block);
            }
            $('.loadscreen-text', local.load).html(text || '');
        },
        additional: function (text) {
            if (local.load == null) {
                return false;
            }
            $('.loadscreen-additional', local.load).html(text || '');
        },
        /**
         * спрчем
         */
        hide: function () {
            local.load.remove();
            local.load = null;
        }
    };
})();