/**
 * модуль для табличных данных

 * @param id
 * @param config
 * @param data
 * @returns {{build: build}}
 * @constructor
 */
var Table = function (id, config, data) {
    let local = {
        id: id || '',
        config: config || {},
        data: data || [],
        template: null
    };
    let self = {
        /**
         * построение
         */
        build: function () {
            let data = {
                id: local.id,
                head: [],
                body: []
            };
            for (let id in local.config) {
                if (local.config.hasOwnProperty(id)) {
                    data.head.push({title: local.config[id]});
                }
            }
            for (let i = 0; i < local.data.length; i++) {
                let data_item = local.data[i];
                let item = {id: (typeof data_item['_id'] != 'undefined') ? data_item['_id'] : '', content: []};
                for (let id in local.config) {
                    if (local.config.hasOwnProperty(id)) {
                        item.content.push({
                            id: id,
                            content: data_item[id]
                        });
                    }
                }
                data.body.push(item);
            }
            local.template = $(Template.render('table', 'simple', data));
        },
        /**
         * вывод контекта
         * @returns {*}
         */
        html: function () {
            return local.template;
        }
    };
    self.build();
    return self;
};