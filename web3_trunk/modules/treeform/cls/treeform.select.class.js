TreeForm.Select = function (parent, data) {
    let local = {
        parent: parent,
        options: data.options,
        template_options: {},
        access: parent.getAccess() || false,
        data: data.value,
        work: {
            template: null,
            elements: [],
            values: []
        }
    };
    let self = {
        initialization: function () {
            local.work.elements = [];
            let array = [];
            if (local.options.multi.toString().toBoolean() == false) {
                array = [local.data];
            } else {
                array = local.data;
            }
            for (let i = 0; i < array.length; i++) {
                if (typeof local.options.format != 'undefined') {
                    array[i] = TreeForm.Format[local.options.format](local.data);
                }
                local.work.elements.push(TreeForm.Validate.text(array[i]));
            }
        },
        render: function () {
            local.template_options = {
                id: local.options.id,
                title: local.options.title,
                elements: local.work.elements,
                multi: local.options.multi.toString().toBoolean(),
                options: function () {
                    try {
                        if (local.options.options) {
                            return local.options.options;
                        }
                        return TreeForm.Options[local.options.list];
                    } catch (e) {
                        return [];
                    }
                }(),
                hidden: function () {
                    let result = false;
                    if (typeof local.options.hidden != 'undefined' && local.options.hidden == false) {
                        result = true;
                    } else {
                        if (!(local.work.elements.length == 1 && local.work.elements[0] == '')) {
                            result = true;
                        }
                    }
                    return result;
                }()
            };
            local.work.template = $(Template.render('treeform', 'elements/select', local.template_options));
            for (let i = 0; i < local.template_options.elements.length; i++) {
                let select = local.work.template.find('select').eq(i);
                select.val(local.work.elements[i]);
                select.selectize();
            }
            return local.work.template.data('object', this);
        },
        titles: function () {
            return $('<div class="tform-titles ' + (local.template_options.hidden ? 'no-vision' : 'vision') + '" id="' + local.options.id + '">' + local.options.title + '</div>');
        },
        getData: function () {
            let data = [];
            $('select', local.work.template).each(function () {
                data.push($(this).val());
            });
            return {[local.options.id]: data.clearEmpty().join(local.options.split || ',')};
        }
    };
    self.initialization();
    return self;
};