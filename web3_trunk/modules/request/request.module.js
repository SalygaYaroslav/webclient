/**
 * ������ ��������
 * @type {{server_list, async, sync, checkWorkStatus, isTimeout, addServer, switchServer, bodyToSend}}
 */
var Request = (function () {
    /** private */
    let base_server_url = __web__.base_server_url;
    let current_server = base_server_url;
    let server_list = [];
    /** piblic */
    return {
        server_list: server_list,
        /**
         * ����������� ������
         * @param {object} data {
         * * timeout: false,
         * * script: '', - ���
         * * data: {}, - ������
         * * callback: function () {}, - ������ ��� ������
         * * progress: function () {}, - ������ ��� ��������� 
         * * error: function () {} - ������ ��� ������
         * }
         * @returns {Boolean}
         */
        async: function (data) {
            let self = this;
            if (typeof data == 'undefined') {
                return false;
            }
            let timeout = null;
            let getXmlHttp = function () {
                let xmlhttp;
                try {
                    xmlhttp = new ActiveXObject('Msxml2.XMLHTTP');
                } catch (e) {
                    try {
                        xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
                    } catch (E) {
                        xmlhttp = false;
                    }
                }
                if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
                    xmlhttp = new XMLHttpRequest();
                }
                return xmlhttp;
            };
            // extend object
            let obj = $.extend({
                timeout: __web__.timeout,
                script: '',
                data: {},
                callback: function () {
                },
                progress: function () {
                },
                error: function () {
                }
            }, data);
            let xmlhttp = getXmlHttp();
            // open
            xmlhttp.open('POST', current_server + '/' + obj.script + '.php', true);
            // check change state
            xmlhttp.onreadystatechange = function () {
                obj.progress(xmlhttp.readyState);
                if (xmlhttp.readyState == 4) {
                    if (obj.timeout) {
                        clearTimeout(timeout);
                    }
                    if (xmlhttp.status == 200) {
                        let rData = xmlhttp.responseText;
                        console.groupCollapsed('<- ' + obj.script + ' xml');
                        console.log(vkbeautify.xml(xmlhttp.responseText));
                        console.groupEnd();
                        if (typeof obj.callback == "function") {
                            // ������� ��� ������, ����� response �.�. ��� ��� �� �����
                            // ��� �� ��������� XML � json ������
                            // �������� ����� ���������� � _
                            let match = rData.match(/\<response .*\<\/response\>/gi);
                            if (match && match.length > 0) {
                                let xmlobject = new XmlObject();
                                try {
                                    xmlobject.setFromText(rData.match(/\<response .*\<\/response\>/gi)[0]);
                                } catch (e) {
                                } finally {
                                    if (self.checkWorkStatus(xmlobject, function () {
                                            self.async(data);
                                        })) {
                                        obj.callback(xmlobject);
                                    }
                                }
                            }
                        }
                    } else {
                        obj.error(xmlhttp.statusText);
                    }
                }
            };
            // if timeout - set it
            if (obj.timeout) {
                timeout = setTimeout(function () {
                    xmlhttp.abort();
                    self.isTimeout('async', data);
                }, obj.timeout);
            }
            // user agent
            if (!obj.data.user_agent) {
                obj.data.user_agent = 'web';
            }
            // send
            let xml = '<?xml version="1.0" encoding="UTF-8" ?>\n';
            xml += x2js.json2xml_str({request: data.data}).replace(/\<-/gm, "<").replace(/\<\/-/gm, "</").replace(/\<#/gm, "<").replace(/\<\/#/gm, "</");
            console.groupCollapsed('-> ' + obj.script + ' xml');
            console.log(vkbeautify.xml(xml));
            console.groupEnd();
            xmlhttp.send(xml);
        },
        /**
         * ���������� ������
         * @param data
         * @returns {*}
         */
        sync: function (data) {
            let self = this;
            let timeout = null;
            if (typeof data == 'undefined') {
                return false;
            }
            let getXmlHttp = function () {
                let xmlhttp;
                try {
                    xmlhttp = new ActiveXObject('Msxml2.XMLHTTP');
                } catch (e) {
                    try {
                        xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
                    } catch (E) {
                        xmlhttp = false;
                    }
                }
                if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
                    xmlhttp = new XMLHttpRequest();
                }
                return xmlhttp;
            };
            // extend object
            let obj = $.extend({
                script: '',
                data: {},
                timeout: __web__.timeout
            }, data);
            let xmlhttp = getXmlHttp();
            // open
            xmlhttp.open('POST', current_server + '/' + obj.script + '.php', false);
            // user agent
            if (!obj.data.user_agent) {
                obj.data.user_agent = 'web';
            }
            // if timeout - set it
            if (obj.timeout) {
                timeout = setTimeout(function () {
                    xmlhttp.abort();
                    self.isTimeout('sync', data);
                }, obj.timeout);
            }
            // send
            let xml = '<?xml version="1.0" encoding="UTF-8" ?>\n';
            xml += x2js.json2xml_str({request: data.data}).replace(/\<-/gm, "<").replace(/\<\/-/gm, "</").replace(/\<#/gm, "<").replace(/\<\/#/gm, "</");
            console.groupCollapsed('-> ' + obj.script + ' xml');
            console.log(vkbeautify.xml(xml));
            console.groupEnd();
            xmlhttp.send(xml);
            if (xmlhttp.readyState == '4') {
                if (obj.timeout) {
                    window.clearTimeout(timeout);
                }
                if (xmlhttp.status == 200) {
                    let rData = xmlhttp.responseText;
                    console.groupCollapsed('<- ' + obj.script + ' xml');
                    console.log(vkbeautify.xml(xmlhttp.responseText));
                    console.groupEnd();
                    // ������� ��� ������, ����� response �.�. ��� ��� �� �����
                    // ��� �� ��������� XML � json ������
                    // �������� ����� ���������� � @
                    let match = rData.match(/\<response .*\<\/response\>/gi);
                    if (match && match.length > 0) {
                        let xmlobject = new XmlObject();
                        try {
                            xmlobject.setFromText(rData.match(/\<response .*\<\/response\>/gi)[0]);
                        } catch (e) {
                            console.log(e);
                        }
                        if (self.checkWorkStatus(xmlobject, function () {
                                self.sync(data)
                            })) {
                            return xmlobject;
                        }
                    }
                }
            }
        },
        /**
         * �������� �� ������� � �� �������
         * @param xmlobject
         * @param error
         * @returns {boolean}
         */
        checkWorkStatus: function (xmlobject, error) {
            let xml = xmlobject.xml();
            switch (xml.attr('status')) {
                case 'error':
                    Notice.error(xml.find('value').text());
                    return true;
                case 'OK':
                    if (xml.find('relogin').length > 0) {
                        this.switchServer(xml.find('relogin').text());
                        if (typeof  error == 'function')
                            setTimeout(function () {
                                error();
                            }, 5000);
                        return false;
                    } else {
                        return true;
                    }
            }
        },
        /**
         * ������ ���� �������
         * @param type
         * @param data
         */
        isTimeout: function (type, data) {
            this.switchServer('auto');
            this[type](data);
        },
        /**
         * ������� ������ � ������
         * @param server_name
         * @returns {number}
         */
        addServer: function (server_name) {
            let index = server_list.indexOf('https://' + server_name);
            if (index != '-1') {
                return index;
            } else {
                server_list.push('https://' + server_name);
                return server_list.length - 1;
            }
        },
        /**
         * ����� ������� �� ������ � ������
         * @param server_name
         */
        switchServer: function (server_name) {
            Notice.notify(Lang.get()['request']['notify']['change_server']);
            let index = 0;
            switch (server_name) {
                case 'auto':
                    index = server_list.indexOf(current_server);
                    if (index >= server_list.length) {
                        index = 0;
                    }
                    break;
                default:
                    index = server_list.indexOf('https://' + server_name);
                    if (index == '-1') {
                        index = this.addServer(server_name);
                    }
                    break;
            }
            current_server = server_list[index] || base_server_url;
        },
        /**
         * ���������� body ��� ��������
         * @param object
         */
        bodyToSend: function (object) {
            let body = '';
            for (let key in object)
                body += '@' + key + '%*' + object[key] + "\r\n";
            return body.encode();
        }
    };
})();