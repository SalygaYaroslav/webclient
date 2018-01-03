/**
 * модуль блока организации
 * @type {{init, render, changeOrg, changOrgTitle, checkIsNeedChangeScene, getCurrentOrganization}}
 */
var OrganizationBlock = (function () {
    /** private */
    let local = {
        current: 'other',
        list: {
            'other': 'Личное'
        },
        array: [],
        main_block: null,
        select_block: null,
        list_block: null
    };
    /** public */
    return {
        /**
         * инициализация блока организации
         * @param block
         * @returns {boolean}
         */
        init: function (block) {
            local.main_block = block;
            let orgs = new List.Organizations('user', Authorization.getUserData('user_props').id).list();
            for (let i = 0; i < orgs.length; i++) {
                let org = orgs[i];
                let avatar = org.getStatusAvatarClass();
                local.list[org.getId()] = {
                    id: org.getId(),
                    name: org.getName(),
                    avatar: avatar
                };
                local.array.push({
                    name: org.getName(),
                    id: org.getId(),
                    avatar: avatar
                });
            }
            // sort by name
            local.array.sort(function (a, b) {
                if (a.name < b.name) {
                    return -1;
                }
                if (a.name > b.name) {
                    return 1;
                }
                return 0;
            });
            // push other
            local.list['other'] = {
                id: 'other',
                name: 'Личное',
                avatar: 'personal'
            };
            local.array.push({
                name: 'Личное',
                id: 'other',
                avatar: 'personal'
            });
            // получим данные из хранилища
            local.current = Dataset.getCustomStorage('organization') || 'other';
            this.render();
            this.changeOrg(local.current);
            return true;
        },
        /**
         * рендерим селекты
         * @returns {*}
         */
        render: function () {
            let self = this;
            let template = $('<div ' +
                'is="organization-block" ' +
                'v-bind:list="list" ' +
                'v-bind:selected="selected" ' +
                'v-bind:show_list="show_list" ' +
                'v-on:select-organization="selectOrganization" ' +
                'v-on:show-list="showList" ' +
                '></div>').appendTo(local.main_block);
            local.vue = new Vue({
                el: template[0],
                data: {
                    list: local.array,
                    selected: local.list[local.current],
                    show_list: false,
                },
                methods: {
                    showList: function () {
                        this.show_list = !this.show_list;
                    },
                    selectOrganization: function (id) {
                        this.selected = local.list[id];
                        this.show_list = false;
                        local.current = id;
                        Dataset.setCustomStorage('organization', id);
                        Interface.reloadNavigateButton(id == 'other');
                        self.checkIsNeedChangeScene();
                    }
                }
            });
            $('body').off('click.organization_select').on('click.organization_select', function (e) {
                if (!$(e.target).hasClass('w-carcase-company') && $(e.target).parents('.w-carcase-company').length == 0) {
                    local.vue.show_list = false;
                }
            });
            // let self = this;
            // local.main_block.delegate('.organization-selected', 'click', function () {
            //     if (local.main_block.hasClass('show-list')) {
            //         local.main_block.removeClass('show-list');
            //     } else {
            //         local.main_block.addClass('show-list');
            //         // close on body click
            //         $('body').off('click.organization_select').on('click.organization_select', function (e) {
            //             if (!$(e.target).hasClass('w-carcase-company') && $(e.target).parents('.w-carcase-company').length == 0) {
            //                 local.main_block.removeClass('show-list');
            //                 $('body').off('click.organization_select');
            //             }
            //         });
            //     }
            // });
            // local.main_block.delegate('.organization-item', 'click', function () {
            //     self.changeOrg($(this).attr('id'));
            // });
            // let template = $(Template.render('organization_block', 'form', {organization_list: local.array}));
            // local.select_block = $('.organization-selected', template);
            // local.list_block = $('.organization-list', template);
            // return template.appendTo(local.main_block);
        },
        /**
         * смена орг
         * @param id ид орг
         * @returns {*|Boolean}
         */
        changeOrg: function (id) {
            local.vue.selectOrganization(id);
            // this.changOrgTitle(id);
            // local.list_block.find('.organization-item.hidden').removeClass('hidden');
            // local.list_block.find('.organization-item#' + id).addClass('hidden');
            // local.main_block.removeClass('show-list');
            // $('body').off('click.organization_select');
            // // перестроим кноки
            // return this.checkIsNeedChangeScene();
        },
        changOrgTitle: function (id) {
            // local.current = id;
            // local.select_block.html('<div id="' + id + '" class="organization-item-selected ellipsis">'
            //     + '<span class="organization-item-avatar ' + local.list[id].avatar + '"></span>'
            //     + '<span class="organization-item-name">' + local.list[id].name + '</span>'
            //     + '</div>');
            // // сохраним
            // Dataset.setCustomStorage('organization', local.current);
            // Interface.reloadNavigateButton(local.current == 'other');
        },
        /**
         * проверка, личное\орг
         * @returns {boolean}
         */
        checkIsNeedChangeScene: function () {
            let scene_name = Scene.getSceneName();
            // инфо\анкета
            if (scene_name == 'profile' && local.current != 'other') {
                Router.goToUrl('info');
                return true;
            }
            if (scene_name == 'info' && local.current == 'other') {
                Router.goToUrl('profile');
                return true;
            }
            // друзья\пользователи
            if (scene_name == 'friends' && local.current != 'other') {
                Router.goToUrl('users');
                return true;
            }
            if (scene_name == 'users' && local.current == 'other') {
                Router.goToUrl('friends');
                return true;
            }
            if (Scene.getSceneObject() != null && typeof Scene.getSceneObject().reload() == 'function') {
                Scene.getSceneObject().reload();
            }
        },
        /**
         * вернем текущую организацию
         */
        getCurrentOrganization: function () {
            return Dataset.get('organization',local.current);
        }
    };
})();