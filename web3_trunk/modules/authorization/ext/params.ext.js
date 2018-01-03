/**
 *
 * @returns {{build: build, show: self.show}}
 * @constructor
 */
Authorization.Params = function () {
    /** private */
    let local = {
        auth: Authorization.getLocalData(),
        windows: null
    };
    /**
     * build window
     */
    let build = function () {
        let lang = Lang.get()['auth']['params'];
        local.windows = new Windows({
            id: 'params',
            title: lang['param'],
            sizes: {
                height: '90%',
                width: '90%'
            }
        })
    };
    /** constructor */
    build();
    /** public */
    return self = {
        build: build,
        /**
         * show window
         */
        show: function () {
            local.windows.show();
        }
    };
};