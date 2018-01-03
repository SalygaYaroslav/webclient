/**
 * модуль шаблонов
 * @type {{getFromCache, render}}
 */
var Template = (function () {
    /** private */
    let cache = {};
    /** public */
    return {
        /**
         * получим данные из кеша или добавим их в кеш
         * @param url
         * @returns {*}
         */
        getFromCache: function (url) {
            if (typeof cache[url] != 'undefined') {
                return cache[url];
            } else {
                // нет в кеше, грузим и кешируем
                // добавляем версию для очистки кеша
                return cache[url] = $.ajax({
                    url: url + '?' + __web__.version,
                    contentType: 'text/html;charset=utf-8',
                    async: false
                }).responseText;
            }
        },
        /**
         * получим шаблон и применим его
         * @param module название модуля
         * @param name название файла без .html
         * @param data данные
         * @returns {*}
         */
        render: function (module, name, data) {
            // проверка параметров
            if (typeof module == 'undefined' || typeof name == 'undefined') {
                return '';
            }
            if (typeof data == 'undefined') {
                data = {};
            }
            // грузим шаблон
            let url = '/modules/' + module + '/template/' + name + '.html';
            // проверяем кеш
            let str = this.getFromCache(url);
            // передаем в плагин
            return Mustache.render(str, {
                text: Lang.get(),
                data: data || {}
            });
        },
        vue: function (module, name) {
            // проверка параметров
            if (typeof module == 'undefined' || typeof name == 'undefined') {
                return '';
            }
            // проверяем кеш
            return this.getFromCache('/modules/' + module + '/template/' + name + '.html');
        }
    };
})();