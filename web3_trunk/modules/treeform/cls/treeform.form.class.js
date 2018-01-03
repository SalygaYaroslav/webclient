/**
 *
 * @param data
 * @param access
 * @returns {{getAccess: getAccess, initialization: initialization, render: render, bindAll: bindAll}}
 * @constructor
 */
TreeForm.Form = function (data, access) {
    /** private */
    let local = {
        access: access || false,
        data: data || false,
        work: {
            template: null,
            children: []
        },
        upload_id: 'upload_' + new Date().getTime()
    };
    let self = {
        getAccess: function () {
            return local.access;
        },
        initialization: function () {
            local.work.children = [];
            for (let id in local.data) {
                local.work.children.push(TreeForm.appendChild(this, local.data[id]));
            }
        },
        render: function () {
            local.work.template = $(Template.render('treeform', 'form'));
            let container = $('.tform-sections', local.work.template);
            for (let i = 0; i < local.work.children.length; i++) {
                container.append(local.work.children[i].render(i));
            }
            self.bindAll();
            return local.work.template.data('object', this);
        },
        bindAll: function () {
            local.work.template.undelegate('.to-expand', 'click').delegate('.to-expand', 'click', function () {
                $(this).parents('.tform-section').eq(0).data('object').expanded($(this).parents('.tform-section-element').eq(0).attr('id'))
            });
            local.work.template.undelegate('.tform-titles', 'click').delegate('.tform-titles', 'click', function () {
                let $this = $(this);
                let id = $this.attr('id');
                let parent = $this.parents('.tform-section-element').eq(0);
                let container = $('.tform-section-elements-container', parent).eq(0);
                if ($this.hasClass('vision')) {
                    $this.removeClass('vision').addClass('no-vision');
                    container.find('#' + id).removeClass('no-vision').addClass('vision');
                } else {
                    $this.removeClass('no-vision').addClass('vision');
                    container.find('#' + id).removeClass('vision').addClass('no-vision');
                }
            });
            local.work.template.undelegate('.tform-title-multi', 'click').delegate('.tform-title-multi', 'click', function () {
                let $this = $(this);
                let parent = $this.parents('.multiple').eq(0);
                parent.data('object').multiple();
            });
            local.work.template.undelegate('.tform-avatar-delete', 'click').delegate('.tform-avatar-delete', 'click', function () {
                let $this = $(this);
                $this.parents('.tform-avatar').eq(0).data('object').deleteImage($this);
            });
            local.work.template.undelegate('.tform-image-delete', 'click').delegate('.tform-image-delete', 'click', function () {
                let $this = $(this);
                $this.parents('.tform-image').eq(0).data('object').deleteImage($this);
            });
            local.work.template.undelegate('.tform-file-delete', 'click').delegate('.tform-file-delete', 'click', function () {
                let $this = $(this);
                $this.parents('.tform-file').eq(0).data('object').deleteFile($this);
            });
        },
        get: function () {
            return local.template;
        },
        getFormData: function (callback) {
            let data = {};
            for (let i = 0; i < local.work.children.length; i++) {
                data = $.extend(data, local.work.children[i].getData());
            }
            Upload.startQueueUpload(local.upload_id, function (data_file) {
                let progress = ((parseInt(data_file.progress) >= 99) ? 100 : parseInt(data_file.progress));
                Interface.Load.additional('Загрузка файла: ' + progress + '%');
            }, function () {
                Interface.Load.additional('');
            }, function () {
                callback(data);
            });
        },
        getUploadId: function () {
            return local.upload_id;
        }
    };
    self.initialization();
    return self;
};