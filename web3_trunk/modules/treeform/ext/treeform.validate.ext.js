TreeForm.Validate = (function () {
    let local = {};
    let self = {
        text: function (text) {
            if (text == 'null') {
                text = '';
            }
            text = text.replace('#empty#', '');
            return text;
        }
    };
    return self;
})();