/**
 *
 * @type {{Load, getBody, renderCarcase, renderOrganizationBlock, renderUserBlock, saveNavigateButtonsSize, saveChatBlockSize, initStorage, saveStorage, reloadNavigateButton, setActiveNavigate, getRightBlock}}
 */
window.Interface = (function () {
    /** private */
    let local = {
        body: null,
        scene: null,
        storage: {
            menu_state: false,
            show_chat: false
        },
        vue: null
    };
    /** public */
    return {
        /**
         * вернем блок тела
         * @returns тело
         */
        getBody: function () {
            if (local.body == null) {
                local.body = $('body').find('#webapp').eq(0);
            }
            return local.body;
        },
        /**
         * строим каркас приложения
         */
        renderCarcase: function () {
            let self = this;
            // инициализация хранилища
            Interface.initStorage();
            let body = local.body;
            // очистим
            let template = $('<div ' +
                'is="app" ' +
                'v-bind:navigate_active="navigate_active" ' +
                'v-bind:navigate="navigate" ' +
                'v-bind:small="small" ' +
                'v-bind:right="right" ' +
                'v-bind:menu="menu" ' +
                'v-on:resize-navigate="resizeNavigate" ' +
                'v-bind:current="current"' +
                '></div>').appendTo(body.empty());
            let lang = Lang.get().interface;
            local.vue = new Vue({
                el: template[0],
                data: {
                    current: 'my',
                    small: local.storage.menu_state,
                    right: local.storage.show_chat,
                    navigate_active: '',
                    navigate: {
                        main: {
                            id: 'main',
                            title: lang.navigate.main,
                            icon: 'Главное-меню',
                            show: true,
                            active: false,
                            click: function (id) {
                                Router.goToUrl(id);
                            }
                        },
                        info: {
                            id: 'info',
                            title: lang.navigate.info,
                            icon: 'Организации',
                            show: true,
                            active: false,
                            only: 'org',
                            click: function (id) {
                                Router.goToUrl(id);
                            }
                        },
                        profile: {
                            id: 'profile',
                            title: lang.navigate.profile,
                            icon: 'Анкета',
                            active: false,
                            show: true,
                            only: 'my',
                            click: function (id) {
                                Router.goToUrl(id);
                            }
                        },
                        users: {
                            id: 'users',
                            title: lang.navigate.users,
                            icon: 'Пользователи',
                            active: false,
                            show: true,
                            only: 'org',
                            click: function (id) {
                                Router.goToUrl(id);
                            }
                        },
                        friends: {
                            id: 'friends',
                            title: lang.navigate.friends,
                            icon: 'Друзья',
                            active: false,
                            show: true,
                            only: 'my',
                            click: function (id) {
                                Router.goToUrl(id);
                            }
                        },
                        projects: {
                            id: 'projects',
                            title: lang.navigate.projects,
                            icon: 'Проекты',
                            active: false,
                            show: true,
                            click: function (id) {
                                Router.goToUrl(id);
                            }
                        },
                        contacts: {
                            id: 'contacts',
                            title: lang.navigate.contacts,
                            icon: 'Контакты',
                            active: false,
                            show: true,
                            click: function (id) {
                                Router.goToUrl(id);
                            }
                        },
                        calendar: {
                            id: 'calendar',
                            title: lang.navigate.calendar,
                            icon: 'Календарь',
                            active: false,
                            show: true,
                            click: function (id) {
                                Router.goToUrl(id);
                            }
                        },
                        crm: {
                            id: 'crm',
                            title: lang.navigate.crm,
                            icon: 'Таблицы',
                            active: false,
                            show: true,
                            click: function (id) {
                                Router.goToUrl(id);
                            }
                        },
                        video: {
                            id: 'video',
                            title: lang.navigate.video,
                            icon: 'Видеоконференции',
                            active: false,
                            show: true,
                            click: function (id) {
                                Router.goToUrl(id);
                            }
                        },
                        files: {
                            id: 'files',
                            title: lang.navigate.files,
                            icon: 'Файлы4',
                            active: false,
                            show: true,
                            click: function (id) {
                                Router.goToUrl(id);
                            }
                        }
                    },
                    menu: [
                        {
                            id: 'telephony',
                            title: lang.menu.telephony,
                            icon: 'Телефония',
                            active: false,
                            disable: false,
                            click: function (status) {

                            }
                        },
                        {
                            id: 'notification',
                            title: lang.menu.notification,
                            icon: 'Оповещения',
                            active: false,
                            disable: false,
                            click: function (status) {

                            }
                        },
                        {
                            id: 'sms', title: lang.menu.sms, icon: 'SMS', active: false, disable: false,
                            click: function (status) {

                            }
                        },
                        {
                            id: 'chat',
                            title: lang.menu.chat,
                            icon: 'Чат',
                            active: local.storage.show_chat,
                            disable: false,
                            click: function (status) {
                                if (Chat._window() == true) {
                                    local.vue.right = false;
                                    self.saveChatBlockSize(false);
                                    // TODO chat show window
                                    // Chat.showWindow(status);
                                } else {
                                    local.vue.right = status;
                                    self.saveChatBlockSize(status);
                                }
                            }
                        },
                        {
                            id: 'notes', title: lang.menu.notes, icon: 'Чаты', active: false, disable: false,
                            click: function (status) {

                            }
                        }
                    ]
                },
                methods: {
                    resizeNavigate: function () {
                        this.small = !this.small;
                        self.saveNavigateButtonsSize(this.small);
                    }
                }
            });
        },
        /**
         * строим блок с организацией
         * т.е. подключаем модуль организаций
         * @returns {*}
         */
        renderOrganizationBlock: function () {
            return OrganizationBlock.init($('.w-carcase-company', local.body).empty());
        },
        /**
         *
         * @returns {*|boolean}
         */
        renderUserBlock: function () {
            return UserBlock.init($('.w-carcase-personal', local.body).empty());
        },
        /**
         * сохраним состояние
         * @param type
         */
        saveNavigateButtonsSize: function (type) {
            local.storage.menu_state = type || false;
            // jQstorage save
            Interface.saveStorage();
        },
        /**
         * сохраним состояние
         * @param type
         */
        saveChatBlockSize: function (type) {
            local.storage.show_chat = type || false;
            // jQstorage save
            Interface.saveStorage();
        },
        /**
         * инициализация хранилища
         */
        initStorage: function () {
            let data = Dataset.getCustomStorage('interface');
            if (data) {
                local.storage = data;
            }
        },
        /**
         * сохраним хранилище
         */
        saveStorage: function () {
            Dataset.setCustomStorage('interface', local.storage);
        },
        /**
         * перегрузим кнопки навигации
         * @param other
         */
        reloadNavigateButton: function (other) {
            local.vue.current = other ? 'my' : 'org';
            for (let id in local.vue.navigate) {
                if (local.vue.navigate.hasOwnProperty(id)) {
                    let button = local.vue.navigate[id];
                    button.show = typeof button.only == 'undefined' || (typeof button.only != 'undefined' && button.only == local.vue.current);
                }
            }
        },
        /**
         * введем активную кнопку
         * @param id
         */
        setActiveNavigate: function (id) {
            if (local.vue.navigate_active) {
                local.vue.navigate[local.vue.navigate_active].active = false;
            }
            local.vue.navigate[id].active = true;
            local.vue.navigate_active = id;
        },
        getRightBlock: function () {
            return $('.w-carcase-right', local.vue.$el);
        }
    };
})();