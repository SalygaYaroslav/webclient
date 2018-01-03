/**
 * ������ ��������
 * @type {{getFromCache, render}}
 */
var Template = (function () {
    /** private */
    let cache = {};
    /** public */
    return {
        /**
         * ������� ������ �� ���� ��� ������� �� � ���
         * @param url
         * @returns {*}
         */
        getFromCache: function (url) {
            if (typeof cache[url] != 'undefined') {
                return cache[url];
            } else {
                // ��� � ����, ������ � ��������
                // ��������� ������ ��� ������� ����
                return cache[url] = $.ajax({
                    url: url + '?' + __web__.version,
                    contentType: 'text/html;charset=utf-8',
                    async: false
                }).responseText;
            }
        },
        /**
         * ������� ������ � �������� ���
         * @param module �������� ������
         * @param name �������� ����� ��� .html
         * @param data ������
         * @returns {*}
         */
        render: function (module, name, data) {
            // �������� ����������
            if (typeof module == 'undefined' || typeof name == 'undefined') {
                return '';
            }
            if (typeof data == 'undefined') {
                data = {};
            }
            // ������ ������
            let url = '/modules/' + module + '/template/' + name + '.html';
            // ��������� ���
            let str = this.getFromCache(url);
            // �������� � ������
            return Mustache.render(str, {
                text: Lang.get(),
                data: data || {}
            });
        },
        vue: function (module, name) {
            // �������� ����������
            if (typeof module == 'undefined' || typeof name == 'undefined') {
                return '';
            }
            // ��������� ���
            return this.getFromCache('/modules/' + module + '/template/' + name + '.html');
        }
    };
})();