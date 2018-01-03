BBlock.Button = function (options) {
    let local = {
        options: {
            icon: options.icon || '',
            visible: options.visible || true,
            title: options.title || '',
        },
        template: null,
        callback: options.callback || function () {
        },
    };
    return {
        render: function () {
            local.template = $(Template.render('bblock', 'button', local.options));
            local.template.off('click').on('click', function () {
                if (typeof local.callback == 'function') {
                    local.callback();
                }
            });
            return local.template;
        },
        reload: function () {
            local.template.remove();
            this.render();
        },
        visible: function (visible) {
            local.visible = visible;
            this.reload();
        }
    };
};