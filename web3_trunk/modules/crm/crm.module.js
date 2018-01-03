/**
 * Crm
 * @type {{getCrmListByOrgId, limitFieldsByPage,Table, List, Structure, Column, Tool}}
 */
window.Crm = (function () {
    let storage = {
        limit: 20,
        structures: {}
    };
    /** private */
    let local = {};
    /**
     * инициализация хранилища
     */
    let initStorage = function () {
        let data = Dataset.getCustomStorage('crm');
        if (data) {
            storage = data;
        }
    };
    initStorage();
    /** public */
    return {
        /**
         * сохраним хранилище
         */
        saveStorage: function () {
            Dataset.setCustomStorage('crm', storage);
        },
        getCrmListByOrgId: function (org_id, default_only, callback) {
            let parseData = function (data) {
                let xml = data.xml();
                let array = [];
                $('crmstructures > crmstructure', xml).each(function (i, item) {
                    let json = Tool.xmlToJson(item);
                    if (default_only) {
                        if (parseInt(json.id) <= 1000000000) {
                            let settings = Tool.stringToXml(json['crm_settings']);
                            if ($('gantt_table', settings).length == 0) {
                                array.push(json);
                            }
                        }
                    } else {
                        array.push(json);
                    }
                });
                return array;
            };
            if (typeof callback == 'function') {
                return Request.getCrms(org_id, function (data) {
                    return callback(parseData(data));
                });
            } else {
                return parseData(Request.getCrms(org_id))
            }
        },
        limitFieldsByPage: function (limit) {
            if (typeof limit == 'undefined') {
                return storage.limit;
            } else {
                storage.limit = parseInt(limit);
                //save storage
                this.saveStorage();
            }
        }
    };
})();