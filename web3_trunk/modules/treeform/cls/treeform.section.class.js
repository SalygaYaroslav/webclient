TreeForm.Section = function (parent, data) {
    /** private */
    let local = {
        options: data.options,
        data: data.value,
        parent: parent,
        access: parent.getAccess() || false,
        work: {
            expand: false,
            template: null,
            children: [],
            elements: []
        }
    };
    let self = {
        getAccess: function () {
            return local.access;
        },
        initialization: function () {
            local.work.children = [];
            local.work.elements = [];
            let array = [];
            if (local.options.multi.toString().toBoolean() == false) {
                array = [local.data];
            } else {
                array = local.data;
            }
            for (let i = 0; i < array.length; i++) {
                let children = [];
                for (let id in array[i]) {
                    let element = TreeForm.appendChild(this, array[i][id]);
                    children.push(element);
                }
                local.work.children.push(children);
                local.work.elements.push({index: i, elements: children});
            }
            if (local.work.children.length > 0) {
                local.work.expand = true;
            }
        },
        renderTemplate: function () {
            let options = {
                id: local.options.id,
                title: local.options.title,
                multi: local.access == true ? (local.options.multi || 'false').toString().toBoolean() : false
            };
            local.work.template = $(Template.render('treeform', 'section/template', options));
        },
        /**
         *
         * @param element
         */
        renderElement: function (element) {
            let parent = $('.tform-section-parents-container', local.work.template);
            let options = {
                index: element.index,
                id: local.options.id,
                title: local.options.title,
                expand: local.work.expand ? 'expanded' : 'unexpanded'
            };
            let element_html = $(Template.render('treeform', 'section/element', options)).appendTo(parent);
            let container = $('.tform-section-elements-container', element_html).eq(0);
            let titles = $('.tform-section-titles-container', element_html).eq(0);
            for (let i = 0; i < element.elements.length; i++) {
                try {
                    container.append(element.elements[i].render(i));
                    titles.append(element.elements[i].titles());
                } catch (e) {

                }
            }
        },
        render: function () {
            self.renderTemplate();
            for (let i = 0; i < local.work.elements.length; i++) {
                self.renderElement(local.work.elements[i]);
            }
            if (local.access == false && $('.tform-section-elements-container', local.work.template).is(':empty')) {
                return '';
            }
            return local.work.template.data('object', this);
        },
        getData: function () {
            let data = {};
            for (let i = 0; i < local.work.children.length; i++) {
                let section_element = local.work.children[i];
                let section_data = {};
                for (let j = 0; j < section_element.length; j++) {
                    let element = section_element[j];
                    let element_data = element.getData();
                    section_data = $.extend(section_data, element_data);
                }
                let empty_section = true;
                for (let id in section_data) {
                    if (section_data[id] != '') {
                        empty_section = false;
                    }
                }
                if (empty_section == false) {
                    for (let id in section_data) {
                        if (typeof data[id] == 'undefined') {
                            data[id] = section_data[id];
                        } else {
                            data[id] = data[id] + '\r' + section_data[id];
                        }
                    }
                } else {
                    for (let id in section_data) {
                        if (typeof data[id] == 'undefined') {
                            data[id] = '';
                        }
                    }
                }
            }
            return data;
        },
        getUploadId: function () {
            return local.parent.getUploadId();
        },
        multiple: function () {
            let index = $('.tform-section-element', local.work.template).length;
            let last = local.data[local.data.length - 1];
            let children = [];
            for (let id in last) {
                last[id].value = "";
                let element = TreeForm.appendChild(this, last[id]);
                children.push(element);
            }
            local.work.children.push(children);
            let element = {index: index, elements: children};
            local.work.elements.push(element);
            self.renderElement(element);
        },
        expanded: function (id) {
            let parent = $('.tform-section-element', local.work.template).eq(id);
            if (parent.hasClass('expanded')) {
                parent.switchClass('expanded', 'unexpanded', 0);
            } else {
                parent.switchClass('unexpanded', 'expanded', 0);
            }
        }
    };
    self.initialization();
    return self;
};