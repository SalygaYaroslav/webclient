TreeForm.Avatar = function (parent, data) {
    /** private */
    let local = {
        parent: parent,
        options: data.options,
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
                    local.work.elements.push({
                        link: 'https://' + __web__.file_url + '/' + TreeForm.Validate.text(array[i]),
                        value: TreeForm.Validate.text(array[i])
                    });
                }
            }
            if (local.work.elements.length == 0) {
                local.work.elements = [''];
            }
        },
        render: function () {
            let options = {
                id: local.options.id,
                title: local.options.title,
                placeholder: local.options.placeholder,
                elements: local.work.elements,
                multi: local.options.multi.toString().toBoolean(),
                access: local.access,
                hidden: ((local.work.elements.length == 0) ? 'no-vision' : 'vision')
            };
            local.work.template = $(Template.render('treeform', 'elements/avatar', options));
            $('input[type=file]', local.work.template).each(function (i) {
                Upload.setUploadByInput($(this), local.parent.getUploadId(), Authorization.getCurrentUser().getFileTask(), function (file, name, e) {
                    self.appendFile(i, file, name, e);
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
                clone.find('input').val('');
                last_element.after(clone);
            } else {
                input.focus().trigger('select');
            }
        },
        getData: function () {
            let data = [];
            $('.tform-avatar-link', local.work.template).each(function () {
                data.push($(this).val());
            });
            return {[local.options.id]: data.clearEmpty().join(local.options.split || ',')};
        },
        appendFile: function (index, file, name) {
            $('.tform-avatar-wrap', local.work.template).eq(index).removeClass('empty');
            let link = $('.tform-avatar-link', local.work.template).eq(index);
            if (link.val() != '' && local.work.need_load == true) {
                Upload.removeFileFromQueue(local.parent.getUploadId(), link.val());
            }
            local.work.need_load = true;
            $('img', local.work.template).eq(index).attr('src', URL.createObjectURL(file));
            link.val(name + '.' + file.extra.extension);
        },
        deleteImage: function (delete_button) {
            let index = $('.tform-avatar-delete', local.work.template).index(delete_button);
            let element = $('.tform-element', local.work.template).eq(index);
            $('.tform-avatar-wrap', local.work.template).addClass('empty');
            $('.tform-avatar-link', local.work.template).val('');
        }
    };
    self.initialization();
    return self;
};