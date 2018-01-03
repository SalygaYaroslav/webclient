TreeForm.Date = function (parent, data) {
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
            let options = {
                id: local.options.id,
                title: local.options.title,
                placeholder: local.options.placeholder,
                elements: local.work.elements,
                multi: local.options.multi.toString().toBoolean(),
                hidden: ((local.work.elements.length == 1 && local.work.elements[0] == '') ? 'no-vision' : 'vision')
            };
            local.work.template = $(Template.render('treeform', 'elements/date', options));
            $('.element-date', local.work.template).each(function () {
                $(this).datetimepicker({
                    lang: Lang.current(),
                    format: local.options.template || 'd.m.Y',
                    timepicker: local.options.timepicker.toString().toBoolean(),
                    datepicker: local.options.datepicker.toString().toBoolean(),
                    appendTo: $('#trash', 'body')
                });
            });
            return local.work.template.data('object', this);
        },
        titles: function () {
            let exp = ((local.work.elements.length == 1 && local.work.elements[0] == '') ? 'vision' : 'no-vision');
            return $('<div class="tform-titles ' + exp + '" id="' + local.options.id + '">' + local.options.title + '</div>');
        },
        multiple: function () {
            let last_element = local.work.template.find('.tform-element:last-child');
            let input = last_element.find('input');
            if (input.val() != '') {
                let clone = last_element.clone();
                let new_input = clone.find('input');
                new_input.val('');
                new_input.datetimepicker({
                    lang: Lang.current(),
                    format: local.options.template || 'd.m.Y',
                    timepicker: local.options.timepicker.toString().toBoolean() || 'true',
                    datepicker: local.options.datepicker.toString().toBoolean() || 'true',
                    appendTo: $('#trash', 'body')
                });
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