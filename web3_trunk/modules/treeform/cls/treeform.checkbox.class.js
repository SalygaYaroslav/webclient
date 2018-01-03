TreeForm.Checkbox = function (parent, data) {
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
                local.work.elements.push(TreeForm.Validate.text(array[i]));
            }
        },
        render: function () {
            local.template_options = {
                id: local.options.id,
                title: local.options.title,
                elements: local.work.elements,
                multi: local.options.multi.toString().toBoolean(),
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
            local.work.template = $(Template.render('treeform', 'elements/checkbox', local.template_options));
            for (let i = 0; i < local.template_options.elements.length; i++) {
                let checkbox = local.work.template.find('input').eq(i);
                checkbox.prop('checked', local.work.elements[i].toString().toBoolean());
            }
            $('.tform-right > label', local.work.template).on('click', function () {
                $(this).prev('input').trigger('click');
            });
            return local.work.template.data('object', this);
        },
        titles: function () {
            return $('<div class="tform-titles ' + (local.template_options.hidden ? 'no-vision' : 'vision') + '" id="' + local.options.id + '">' + local.options.title + '</div>');
        },
        getData: function () {
            let data = [];
            $('input[type=checkbox]', local.work.template).each(function () {
                data.push($(this).prop('checked').toString());
            });
            return {[local.options.id]: data.clearEmpty().join(local.options.split || ',')};
        }
    };
    self.initialization();
    return self;
};