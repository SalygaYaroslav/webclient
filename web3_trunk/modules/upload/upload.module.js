/**
 *
 * @type {{getIconButton, setFormDrop, getQueue, removeQueue, removeFileFromQueue, startQueueUpload}}
 */
var Upload = (function () {
    let local = {
        queues: {}
    };
    /**
     *
     * @param id
     * @param task
     * @returns {{addFile: addFile}}
     * @constructor
     */
    let Queue = function (id, task) {
        let local = {
            id: id,
            task: task,
            files: {}
        };
        /**
         *
         * @param data
         * @returns {{}}
         * @constructor
         */
        let File = function (data) {
            let local = {
                queue: data.queue,
                id: data.id,
                e: data.e,
                file: data.file,
                filename: data.filename,
                hash: null,
                xhr: new XMLHttpRequest()
            };
            return {
                local: local,
                /**
                 *
                 * @param file
                 * @param progress
                 * @param loadend
                 */
                uploadChunk: function (file, progress, loadend) {
                    let blob = file.blob;
                    let xhr = local.xhr;
                    let full_name = local.file.extra.nameNoExtension + "." + local.file.extra.extension;
                    let start = file.start;
                    let end = file.end - 1;
                    let size = file.size;
                    xhr.open('POST', __web__.upload_server_url + '?' + Tool.buildURIParams({
                            user_login: Authorization.getUserAuthData().login,
                            user_password: Authorization.getUserAuthData().password,
                            project_id: 0,
                            id: local.queue.getTaskId(),
                            obj: 'task',
                            target_fname: local.filename,
                            original: full_name
                        }), true);
                    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
                    xhr.setRequestHeader('Content-Disposition', 'attachment; filename=' + local.filename);
                    xhr.setRequestHeader('X-Content-Range', 'bytes ' + start + '-' + end + '/' + size);
                    xhr.setRequestHeader('X-Session-ID', local.id);
                    xhr.onprogress = function (e) {
                        progress((end / size * 100));
                    };
                    xhr.onloadend = function (e) {
                        loadend(e);
                    };
                    xhr.send(blob);
                },
                /**
                 *
                 * @param progress
                 * @param loaded
                 */
                upload: function (progress, loaded) {
                    let self = this;
                    let chunks = [];
                    let go = function (index) {
                        self.uploadChunk(chunks[index], function (value) {
                            progress({id: local.id, progress: value});
                        }, function (e) {
                            index++;
                            if (index < chunks.length) {
                                go(index);
                            } else {
                                if (e.target.responseText) {
                                    let object = null;
                                    try {
                                        let match = e.target.responseText.match(/<response.*\/>/gi);
                                        if (match && match.length > 0) {
                                            let response = match[0];
                                            let xml_object = new XmlObject();
                                            xml_object.setFromText(response);
                                            let xml = xml_object.xml();
                                            object = Tool.xmlAttrToJson(xml[0]);
                                        } else {
                                            let match = e.target.responseText.match(/\<response .*\<\/response\>/gi);
                                            if (match && match.length > 0) {
                                                let response = match[0];
                                                let xml_object = new XmlObject();
                                                xml_object.setFromText(response);
                                                let xml = xml_object.xml();
                                                object = Tool.xmlAttrToJson(xml[0]);
                                            }
                                        }
                                    } catch (e) {
                                        console.log(e);
                                    }
                                    loaded(local.id, local.file, object);
                                }
                            }
                        })
                    };
                    let blobSlice = Blob.prototype.slice;
                    let chunkSize = 2097152;
                    let size = local.file.size;
                    let current = 1;
                    let length = Math.ceil(local.file.size / chunkSize);
                    let spark = new SparkMD5.ArrayBuffer();
                    let fileReader = new FileReader();
                    let start = 0;
                    let end = ((start + chunkSize) >= size) ? size : start + chunkSize;
                    let blob = blobSlice.call(local.file, start, end);
                    fileReader.onload = function (e) {
                        spark.append(e.target.result);
                        chunks.push({blob: blob, start: start, end: end, size: size});
                        if (current == length) {
                            local.hash = spark.end().toUpperCase();
                            go(0);
                        } else {
                            start = current * chunkSize;
                            end = ((start + chunkSize) >= size) ? size : start + chunkSize;
                            blob = blobSlice.call(local.file, start, end);
                            fileReader.readAsArrayBuffer(blob);
                            current++;
                        }
                    };
                    fileReader.readAsArrayBuffer(blob);
                },
                /**
                 * get data
                 * @returns {{queue, id, e: (*|string|string|e|ui.resizable._change.e), file: *, filename: (string|*)}}
                 */
                getData: function () {
                    return local;
                }
            };
        };

        return {
            local: local,
            generateFileGuid: function () {
                return md5(new Date().getTime().toString() + Number(Math.floor(Math.random() * (255 + 1))).toString()).substring(0, 16).toUpperCase();
            },
            /**
             *
             * @param e
             * @param file
             * @returns {*}
             */
            addFile: function (e, file) {
                let self = this;
                let id = self.generateFileGuid();
                local.files[id] = new File({
                    queue: self,
                    id: id,
                    e: e,
                    file: file,
                    filename: id + '.' + file.extra.extension
                });
                return id;
            },
            /**
             *
             * @param id
             * @returns {*}
             */
            removeFile: function (id) {
                if (typeof local.files[id] != 'undefined') {
                    delete local.files[id];
                    return Object.keys(local.files).length;
                }
                return false;
            },
            getTaskId: function () {
                if (typeof local.task != 'undefined') {
                    return local.task.getId();
                } else {
                    return 0;
                }
            },
            /**
             *
             * @param progress
             * @param file_end
             * @param queue_end
             */
            startUpload: function (progress, file_end, queue_end) {
                let uploaded = {};
                for (let id in local.files) {
                    if (local.files.hasOwnProperty(id)) {
                        local.files[id].upload(progress, function (file_id, file, object) {
                            let status = '';
                            let text = '';
                            if (object.status == 'OK') {
                                status = 'success';
                            } else {
                                status = 'error';
                                text = 'Файл ' + file.name + ' не был загружен по причине:';
                                switch (object['err_num']) {
                                    case '142':
                                        text += ' дисковое пространство исчерпано';
                                        break;
                                }
                                Notice.error(text);
                            }
                            file_end(file_id, status);
                            uploaded[file_id] = {
                                file: local.files[file_id],
                                status: status
                            };
                            delete local.files[file_id];
                            if (Object.keys(local.files).length == 0) {
                                queue_end(uploaded);
                            }
                        });
                    }
                }
            }
        };
    };

    return {
        local: local,
        /**
         *
         * @param queue_id
         * @param id
         * @param task
         * @param additional_class
         * @param callback
         */
        getIconButton: function (queue_id, id, task, additional_class, callback) {
            let self = this;
            let template = $(Template.render('upload', 'button', {
                id: id,
                additional_class: additional_class
            }));
            let input = $('#' + id, template);
            input.fileReaderJS({
                readAsDefault: "DataURL",
                on: {
                    load: function (e, file, a, b) {
                        let queue = self.getQueue(queue_id, task);
                        let name = queue.addFile(e, file);
                        callback(file, name);
                    }
                }
            });
            return template.data('input', input);
        },
        /**
         *
         * @param input
         * @param queue_id
         * @param task
         * @param callback
         */
        setUploadByInput: function (input, queue_id, task, callback) {
            let self = this;
            input.fileReaderJS({
                readAsDefault: "DataURL",
                on: {
                    load: function (e, file, a, b) {
                        let queue = self.getQueue(queue_id, task);
                        let name = queue.addFile(e, file);
                        callback(file, name);
                    }
                }
            });
            return input;
        },
        /**
         *
         * @param queue_id
         * @param task
         * @param block
         * @param callback
         */
        setFormDrop: function (queue_id, task, block, callback) {
            let self = this;
            block.fileReaderJS({
                dragClass: 'file-now-dragged',
                readAsDefault: "DataURL",
                on: {
                    load: function (e, file) {
                        let queue = self.getQueue(queue_id, task);
                        let name = queue.addFile(e, file);
                        callback(file, name, e);
                    }
                }
            });
        },
        /**
         *
         * @param id
         * @param task
         * @returns {*}
         */
        getQueue: function (id, task) {
            if (typeof id == 'undefined') {
                return local.queues;
            }
            return ((typeof local.queues[id] != 'undefined') ? local.queues[id] : (function (id, task) {
                if (typeof local.queues[id] != 'undefined' || typeof task == 'undefined') {
                    return false;
                } else {
                    return local.queues[id] = new Queue(id, task);
                }
            })(id, task));
        },
        /**
         *
         * @param id
         * @returns {boolean}
         */
        removeQueue: function (id) {
            if (typeof local.queues[id] != 'undefined') {
                delete local.queues[id];
                return true;
            }
            return false;
        },
        /**
         *
         * @param queue_id
         * @param id
         * @returns {boolean}
         */
        removeFileFromQueue: function (queue_id, id) {
            let self = this;
            if (typeof local.queues[queue_id] != 'undefined') {
                let queue = self.getQueue(queue_id);
                let files_length = queue.removeFile(id);
                if (files_length == 0) {
                    self.removeQueue(queue_id);
                }
                return true;
            }
            return false;
        },
        /**
         *
         * @param id
         * @param progress
         * @param file_load
         * @param queue_load
         */
        startQueueUpload: function (id, progress, file_load, queue_load) {
            let self = this;
            if (typeof id != 'undefined' && typeof local.queues[id] != 'undefined') {
                let queue = self.getQueue(id);
                if (queue) {
                    queue.startUpload(function (data) {
                            progress(data);
                        },
                        function (file, status) {
                            file_load(file, status);
                        },
                        function (files) {
                            self.removeQueue(id);
                            queue_load(files);
                        });
                }
            } else {
                queue_load(null);
            }
        }
    };
})();