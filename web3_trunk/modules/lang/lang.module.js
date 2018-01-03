/**
 * языковой модуль
 * @type {{get, loadConfig, current, checkLang}}
 */
var Lang = (function () {
    /** private */
    let custom = '';
    let default_lang = 'ru';
    let data = {};
    let current = '';
    /** public */
    return {
        /**
         * выводим данные
         * @returns {{}}
         */
        get: function () {
            return data;
        },
        /**
         * грузим конфиг
         * @param callback_
         * @param custom_lang
         */
        loadConfig: function (callback_, custom_lang) {
            let lang = custom_lang || custom || this.checkLang();
            let url = '/_lang/' + lang + '.json';
            $.ajax({
                url: url,
                dataType: 'json',
                success: function (loadedData) {
                    $.extend(data, loadedData);
                    /** lang moment js **/
                    moment.locale(lang);
                    current = lang;
                    return callback_();
                },
                error: function () {
                    if (default_lang != lang) {
                        loadConfig(callback_, default_lang);
                        current = default_lang;
                    }
                }
            });
        },
        current: function () {
            return current;
        },
        /**
         * проверка языка браузера
         * @returns {*}
         */
        checkLang: function () {
            return (navigator.language || navigator.userLanguage).split('-')[0];
        }
    };
})();