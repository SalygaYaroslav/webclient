/**
 *
 */
var TreeForm = (function () {
    let cache = {};
    let local = {
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
         *
         * @param name
         * @returns {*}
         */
        loadConfig: function (name) {
            // ������ ������
            let url = '/modules/treeform/configs/' + name + '.json';
            // ��������� ���
            let config = $.parseJSON(this.getFromCache(url));
            let split = name.split('/');
            return config[split[split.length - 1]];
        },
    };
    /**
     * public
     * @type {{}}
     */
    return {
        /**
         * ������� �����
         * @param name
         * @param data
         * @param access
         * @returns {TreeForm.Form}
         */
        getTreeForm: function (name, data, access) {
            let config = local.loadConfig(name);
            return new TreeForm.Form(data(config), access);
        },
        /**
         * �������� ������� � ��������
         * @param parent
         * @param data
         */
        appendChild: function (parent, data) {
            let type = data.options.type;
            let access = parent.getAccess();
            if (type != 'section') {
                if (access != true && type != 'image' && type != 'avatar') {
                    type = 'html';
                }
            }
            return new TreeForm[type.capitalize()](parent, data);
        },
        loadConfig: function (name) {
            return local.loadConfig(name);
        }
    };
})();