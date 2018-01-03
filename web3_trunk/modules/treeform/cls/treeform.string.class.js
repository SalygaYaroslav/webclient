TreeForm.String = function (parent, data) {
    /** private */
    let local = {
        parent: parent,
        options: data.options,
        template_options: {},
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
                placeholder: local.options.placeholder,
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
            local.work.template = $(Template.render('treeform', 'elements/string', local.template_options));
            return local.work.template.data('object', this);
        },
        titles: function () {
            return $('<div class="tform-titles ' + (local.template_options.hidden ? 'no-vision' : 'vision') + '" id="' + local.options.id + '">' + local.options.title + '</div>');
        },
        multiple: function () {
            let last_element = local.work.template.find('.tform-element:last-child');
            let input = last_element.find('input');
            if (input.val() != '') {
                let clone = last_element.clone();
                clone.find('input').val('');
                last_element.after(clone);
            } else {
                input.focus().trigger('select');
            }
        },
        getData: function () {
            let data = [];
            $('input', local.work.template).each(function () {
                data.push($(this).val());
            });
            return {[local.options.id]: data.clearEmpty().join(local.options.split || ',')};
        }
    };
    self.initialization();
    return self;
};