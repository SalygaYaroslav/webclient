/**
 * ���� �����
 * @type {{init, render}}
 */
var UserBlock = (function () {
    /** private */
    let local = {
        main_block: null
    };
    /** public */
    return {
        /**
         * ������������� ����� �����������
         * @param block
         * @returns {boolean}
         */
        init: function (block) {
            local.main_block = block;
            this.render();
            return this;
        },
        /**
         * �������� �������
         * @returns {*}
         */
        render: function () {
            let user = Authorization.getCurrentUser();
            let template = $('<div ' +
                'is="user-block" ' +
                'v-bind:list="list" ' +
                'v-bind:show_list="show_list" ' +
                'v-bind:user="user" ' +
                'v-on:show-list="showList" ' +
                'v-on:select-button="selectButton" ' +
                '></div>').appendTo(local.main_block);
            let lang = Lang.get().user_block.menu;
            local.vue = new Vue({
                el: template[0],
                data: {
                    list: [
                        {
                            id: 'profile',
                            icon: '������',
                            title: lang.profile,
                            callback: function () {
                            }
                        },
                        {
                            id: 'personal_billing',
                            icon: '������-����',
                            title: lang.personal_billing,
                            callback: function () {
                            }
                        },
                        {
                            id: 'organization_billing',
                            icon: '����-�����������',
                            title: lang.organization_billing,
                            callback: function () {
                            }
                        },
                        {
                            id: 'params',
                            icon: '���������',
                            title: lang.properties,
                            callback: function () {
                                let params = new Authorization.Params();
                                params.show();
                            }
                        },
                        {
                            id: 'storage',
                            icon: '��������-���������',
                            title: lang.clear_storage,
                            callback: function () {
                                Dataset.flushStorage();
                            }
                        },
                        {
                            id: 'exit',
                            icon: '�������8',
                            title: lang.exit,
                            callback: function () {
                                Authorization.logout();
                            }
                        }
                    ],
                    user: user.vmData,
                    show_list: false,
                },
                methods: {
                    showList: function () {
                        this.show_list = !this.show_list;
                    },
                    selectButton: function (callback) {
                        this.show_list = false;
                        callback();
                    }
                }
            });
            $('body').off('click.user_params').on('click.user_params', function (e) {
                if (!$(e.target).hasClass('w-carcase-personal') && $(e.target).parents('.w-carcase-personal').length == 0) {
                    local.vue.show_list = false;
                }
            });
        },
        /**
         * �������
         */
        bind: function () {
            // local.main_block.on('click', function () {
            //     if (local.main_block.hasClass('show-params')) {
            //         local.main_block.removeClass('show-params');
            //     } else {
            //         local.main_block.addClass('show-params');
            //         // close on body click
            //         $('body').off('click.user_params').on('click.user_params', function (e) {
            //             if (!$(e.target).hasClass('w-carcase-personal') && $(e.target).parents('.w-carcase-personal').length == 0) {
            //                 local.main_block.removeClass('show-params');
            //                 $('body').off('click.user_params');
            //             }
            //         });
            //     }
            // });
            //
            // $('.--exit', local.main_block).on('click', function () {
            //     Authorization.logout();
            // });
            // $('.--storage', local.main_block).on('click', function () {
            //     Dataset.flushStorage();
            // });
            // $('.--params', local.main_block).on('click', function () {
            //     let params = new Authorization.Params();
            //     params.show();
            // });
        }
    };
})();