window.BBlock = function () {
    let local = {
        vue: null
    };
    return {
        initialization: function () {
            let template = $('<button-block v-bind:buttons="buttons"></button-block>').appendTo('.w-carcase-footer', Interface.getBody());
            local.vue = new Vue({
                el: template[0],
                data: {
                    buttons: {}
                }
            });
        },
        clear: function () {
            local.vue.buttons = {};
        },
        appendCollection: function (collection) {
            this.clear();
            local.vue.buttons = collection;
        },
        getButtonFromCollection: function (button_id) {
            if (typeof button_id != 'undefined') {
                for (let i = 0; i < local.vue.buttons.length; i++) {
                    if (local.vue.buttons[i].id == button_id) {
                        return local.vue.buttons[i];
                    }
                }
            }
            return false;
        },
        changeButtonVisible: function (id, status) {
            let button = this.getButtonFromCollection(id);
            if (button) {
                button.rights = status || false;
            }
        }
    };
}();