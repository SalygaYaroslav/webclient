window.Render = (function () {
    Vue.component('app', {
        template: Template.vue('interface', 'vue'),
        props: ['navigate', 'menu', 'current', 'small', 'right', 'navigate_active'],
        methods: {
            resizeNavigate: function () {
                this.$emit('resize-navigate');
            }
        }
    });
    Vue.component('button-navigate', {
        template: Template.vue('interface', 'button_navigate'),
        props: ['data'],
        methods: {
            click: function (id) {
                if (typeof this.data.click == 'function') {
                    this.data.click(id);
                }
            }
        }
    });
    Vue.component('organization-block', {
        template: Template.vue('organization_block', 'vue'),
        props: ['list', 'selected', 'show_list'],
        methods: {
            selectOrganization: function (id) {
                this.$emit('select-organization', id);
            },
            showList: function () {
                this.$emit('show-list');
            }
        }
    });
    Vue.component('user-block', {
        template: Template.vue('user_block', 'user_block'),
        props: ['list', 'show_list', 'user'],
        methods: {
            selectButton: function (callback) {
                this.$emit('select-button', callback);
            },
            showList: function () {
                this.$emit('show-list');
            }
        }
    });
    Vue.component('button-block', {
        template: Template.vue('bblock', 'block'),
        props: ['buttons']
    });
    Vue.component('button-block-item', {
        template: Template.vue('bblock', 'button'),
        props: ['data'],
        methods: {
            click: function () {
                if (typeof this.data.click == 'function') {
                    this.data.click();
                }
            }
        }
    });
    Vue.component('button-block-empty', {
        template: Template.vue('bblock', 'empty')
    });
    Vue.component('crm-table', {
        template: Template.vue('crm', 'crm'),
        props: ['thead', 'tfoot', 'tbody', 'thidden', 'pagination'],
        data: function () {
            return {additional: false};
        },
        methods: {
            theadClick: function (id) {
                this.$emit('thead-click', id);
            },
            paginationClick: function (value) {
                this.$emit('pagination_click', value);
            },
            paginationPageClick: function (item) {
                this.$emit('pagination_page_click', item);
            },
            limitClick: function (item) {
                this.$emit('limit_click', item);
            },
            selectTr: function (event, index, id) {
                this.$emit('select_tr', event, index, id);
            },
            dblSelectTr: function (event, index, id) {
                this.$emit('dbl_select_tr', event, index, id);
            },
        }
    });
    Vue.component('crm-params', {
        template: Template.vue('crm', 'params'),
        props: ['list', 'selected'],
        data: function () {
            return {};
        },
        methods: {
            select: function (id) {
                this.$emit('select', id);
            },
            editRow: function (id) {
                this.$emit('edit-row', id);
            }
        }
    });
    Vue.component('crm-search-input', {
        template: Template.vue('crm', 'search-input'),
        props: ['data'],
        data: function () {
            return {};
        },
        methods: {
            keyup: function () {
                this.$emit('keyup');
            }
        }
    });
    Vue.component('chat', {
        template: Template.vue('chat', 'chat'),
        props: ['users', 'chats', 'active', 'selected'],
        methods: {
            select: function (id) {
                this.$emit('select', id);
            },
            send: function (id) {
                this.$emit('send', id);
            },
            close: function (id) {
                this.$emit('close', id);
            }
        },
        computed: {
            sortedItems: function () {
                return this.users.sort(function (a, b) {
                    let a_name = a.name.toLowerCase();
                    let b_name = b.name.toLowerCase();
                    if (a_name > b_name) {
                        return 1;
                    }
                    if (a_name < b_name) {
                        return -1;
                    }
                    return 0;
                });
            },
            sortedChats: function () {
                let array = Object.keys(this.chats);
                return array.sort(function (a, b) {
                    let a_name = a.name.toLowerCase();
                    let b_name = b.name.toLowerCase();
                    if (a_name > b_name) {
                        return 1;
                    }
                    if (a_name < b_name) {
                        return -1;
                    }
                    return 0;
                });
            }
        },
    });
    Vue.component('chat-message', {
        template: Template.vue('chat', 'chat_message'),
        props: ['data']
    });
    Vue.component('chat-active-user', {
        template: Template.vue('chat', 'chat_active_user'),
        props: ['data', 'selected', 'selectUser'],
    });
    Vue.component('chat-user', {
        template: Template.vue('chat', 'chat_user'),
        props: ['data', 'selected', 'selectUser'],
    });
    Vue.component('chat-item', {
        template: Template.vue('chat', 'chat_item'),
        props: ['chat', 'closeChat', 'sendChat', 'chat_id'],
    });
})();