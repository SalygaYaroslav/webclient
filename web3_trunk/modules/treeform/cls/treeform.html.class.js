TreeForm.Html = function (parent, data) {
    /** private */
    let local = {
        parent: parent,
        options: data.options,
        access: parent.getAccess() || false,
        data: data.value,
        work: {
            template: null,
            elements: []
        }
    };
    let self = {
        initialization: function () {
            local.work.elements = [];
            local.work.elements = [];
            let array = [];
            if (local.options.multi.toString().toBoolean() == false) {
                array = [local.data];
            } else {
                array = local.data;
            }
            for (let i = 0; i < array.length; i++) {
                switch (local.options.type) {
                    case 'select':
                        if (typeof local.options.list != 'undefined') {
                            let list = TreeForm.Options[local.options.list]();
                            for (let j = 0; j < list.length; j++) {
                                if (list[j].value == array[i]) {
                                    let obj = list[j];
                                    if (obj.dont_show == true) {
                                        array[i] = '';
                                    } else {
                                        array[i] = obj.text;
                                    }
                                    break;
                                }
                            }
                        }
                        break;
                    default:
                        break;
                }
                if (typeof local.options.format != 'undefined') {
                    array[i] = TreeForm.Format[local.options.format](local.data);
                }
                local.work.elements.push(TreeForm.Validate.text(array[i]));
            }
            local.work.elements = local.work.elements.clearEmpty();
        },
        render: function () {
            if (local.work.elements.length == 0) {
                return '';
            }
            let options = {
                id: local.options.id,
                title: local.options.title,
                elements: local.work.elements,
            };
            local.work.template = $(Template.render('treeform', 'elements/html', options));
            return local.work.template.data('object', this);
        },
        titles: function () {
            return '';
        }
    };
    self.initialization();
    return self;
};