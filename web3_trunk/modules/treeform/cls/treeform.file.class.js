TreeForm.File = function (parent, data) {
    /** private */
    let local = {
        parent: parent,
        options: data.options,
        template_options: {},
        access: parent.getAccess() || false,
        data: data.value,
        work: {
            template: null,
            elements: [],
            need_load: false
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
                if (array[i] && array[i] != '') {
                    let file = TreeForm.Validate.text(array[i]).split('\n');
                    let title = file[0];
                    let link = file[1];
                    local.work.elements.push({
                        link: 'https://' + __web__.file_url + '/' + link,
                        title: title,
                        full: TreeForm.Validate.text(array[i])
                    });
                }
            }
            if (local.work.elements.length == 0) {
                local.work.elements = [''];
            }
        },
        render: function () {
            local.template_options = {
                id: local.options.id,
                title: local.options.title,
                placeholder: local.options.placeholder,
                elements: local.work.elements,
                multi: local.options.multi.toString().toBoolean(),
                access: local.access,
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
            local.work.template = $(Template.render('treeform', 'elements/file', local.template_options));
            $('input[type=file]', local.work.template).each(function (i) {
                Upload.setUploadByInput($(this), local.parent.getUploadId(), Authorization.getCurrentUser().getFileTask(), function (file, name, e) {
                    self.appendFile(i, file, name, e);
                });
            });
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
            $('.tform-file-full', local.work.template).each(function () {
                data.push($(this).val());
            });
            return {[local.options.id]: data.clearEmpty().join(local.options.split || ',')};
        },
        appendFile: function (index, file, name) {
            let link = $('.tform-file-full', local.work.template).eq(index);
            if (link.val() != '' && local.work.need_load == true) {
                Upload.removeFileFromQueue(local.parent.getUploadId(), link.val());
            }
            local.work.need_load = true;
            $('.tform-file-value', local.work.template).eq(index).val(file.name);
            link.val(file.name + '\n' + name + '.' + file.extra.extension + '\n' + name);
        },
        deleteFile: function (delete_button) {
            let index = $('.tform-file-delete', local.work.template).index(delete_button);
            let element = $('.tform-element', local.work.template).eq(index);
            let link = $('.tform-file-full', element);
            if (local.work.need_load) {
                Upload.removeFileFromQueue(local.parent.getUploadId(), link.val());
                local.work.need_load = false;
                link.val('');
                $('.tform-file-value', element).val('');
            } else {
                link.val('');
                $('.tform-file-value', element).val('');
            }
        }
    };
    self.initialization();
    return self;
};