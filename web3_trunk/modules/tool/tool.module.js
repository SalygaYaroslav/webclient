/**
 * модуль инструментов
 * @type {{stringToJson, stringToXml, xmlToJson, jsonToXmls, xmlAttrToJson, decode, getFileType, formatBytes, replaceTags, generateGuid, buildURIParams, playAudio, phone}}
 */
var Tool = (function () {
    /** public */
    return {
        /**
         * строка в объект
         * @param string
         * @param prefix
         */
        stringToJson: function (string, prefix) {
            if (typeof prefix != 'undefined') {
                string = '<' + prefix + '>' + string + '</' + prefix + '>';
            }
            return x2js.xml_str2json(string);
        },
        /**
         * строка в xml
         * @param string
         * @param prefix
         */
        stringToXml: function (string, prefix) {
            if (typeof prefix != 'undefined') {
                string = '<' + prefix + '>' + string + '</' + prefix + '>';
            }
            return x2js.parseXmlString(string);
        },
        /**
         * xml в объект
         * @param xml
         */
        xmlToJson: function (xml) {
            return x2js.xml2json(xml);
        },
        /**
         *
         * @param json
         */
        jsonToXmls: function (json) {
            return x2js.json2xml_str(json);
        },
        /**
         * xml атрибуты в объект
         * @param xml
         * @returns {{}}
         */
        xmlAttrToJson: function (xml) {
            let object = {};
            $(xml.attributes).each(function (i, attr) {
                object[attr.name] = Tool.decode(attr.value);
            });
            return object;
        },
        /**
         * декодинг
         * @param text
         * @returns {*}
         */
        decode: function (text) {
            return x2js.decode(text);
        },
        /**
         * получить тип файла
         * @param link
         * @returns {{type: string, extension: *}}
         */
        getFileType: function (link) {
            let split = link.split('.');
            let type = split[split.length - 1];
            let file_type = 'file';
            switch (type.toLowerCase()) {
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'gif':
                case 'svg':
                case 'bmp':
                    file_type = 'image';
                    break;
                case "tiff":
                case "ppt":
                case "pps":
                case "doc":
                case "docx":
                    file_type = 'doc';
                    break;
                case "xls":
                case "xlsx":
                    file_type = 'xls';
                    break;
                case "pdf":
                case "rtf":
                    file_type = 'pdf';
                    break;
            }
            return {
                type: file_type,
                extension: type
            }
        },
        /**
         * форматирование байт
         * @param bytes
         * @param decimals
         * @returns {*}
         */
        formatBytes: function (bytes, decimals) {
            if (bytes == 0) {
                return '0 Bytes';
            }
            let k = 1024;
            let dm = decimals + 1 || 3;
            let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            let i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        },
        /**
         * удалить теги
         * @param html_text
         * @returns {*}
         */
        replaceTags: function (html_text) {
            $(html_text).find('style').remove();
            $(html_text).find('script').remove();
            for (let i = 0; i < html_text.length; i++) {
                if ($(html_text[i]).is('style')) {
                    html_text.splice(i, 1);
                }
                if ($(html_text[i]).is('meta')) {
                    html_text.splice(i, 1);
                }
                if ($(html_text[i]).is('script')) {
                    html_text.splice(i, 1);
                }
            }
            return html_text;
        },
        /**
         *
         * @param length_
         * @returns {string}
         */
        generateGuid: function (length_) {
            let length = parseInt(((length_) ? length_ : 16) / 2);
            let n;
            let lg = "";
            for (let i = 0; i < length; i++) {
                n = Math.floor(Math.random() * (255 + 1));
                let num = Number(n).toString(16);
                if (num.length == 1) {
                    num = '0' + num;
                }
                lg = lg + num;
            }
            return lg.toUpperCase();
        },
        buildURIParams: function (a) {
            function buildParams(prefix, obj, add) {
                if (jQuery.isArray(obj) && obj.length) {
                    // Serialize array item.
                    jQuery.each(obj, function (i, v) {
                        // If array item is non-scalar (array or object), encode its
                        // numeric index to resolve deserialization ambiguity issues.
                        // Note that rack (as of 1.0.0) can't currently deserialize
                        // nested arrays properly, and attempting to do so may cause
                        // a server error. Possible fixes are to modify rack's
                        // deserialization algorithm or to provide an option or flag
                        // to force array serialization to be shallow.
                        buildParams(prefix + "[" + (typeof v === "object" || jQuery.isArray(v) ? i : "") + "]", v, add);
                    });

                } else if (obj != null && typeof obj === "object") {
                    // If we see an array here, it is empty and should be treated as an empty
                    // object
                    if (jQuery.isArray(obj) || jQuery.isEmptyObject(obj)) {
                        add(prefix, "");
                        // Serialize object item.
                    } else {
                        for (let name in obj) {
                            buildParams(prefix + "[" + name + "]", obj[name], add);
                        }
                    }

                } else {
                    // Serialize scalar item.
                    add(prefix, obj);
                }
            }

            let s = [],
                add = function (key, value) {
                    // If value is a function, invoke it and return its value
                    value = jQuery.isFunction(value) ? value() : value;
                    s[s.length] = encodeURIComponent(key) + "=" + value.toString().encode();
                };
            // If an array was passed in, assume that it is an array of form elements.
            if (jQuery.isArray(a) || (!jQuery.isPlainObject(a))) {
                // Serialize the form elements
                jQuery.each(a, function () {
                    add(this.name, this.value);
                });
            } else {
                // If traditional, encode the "old" way (the way 1.3.2 or older
                // did it), otherwise encode params recursively.
                for (let prefix in a) {
                    buildParams(prefix, a[prefix], add);
                }
            }
            // Return the resulting serialization
            let r20 = /%20/g;
            return s.join("&").replace(r20, "+");
        },
        playAudio: function (url) {
            if (navigator.appName != "Microsoft Internet Explorer" && typeof Audio == "function") {
                let audio = new Audio();
                audio.src = url;
                audio.play();
            }
        },
        phone: {
            checkPhone: function (number, nochecksize) {
                let arr = [
                    {
                        mask: '7',
                        size: 11,
                        country: 'Россия',
                        code: 'ru',
                        regexp: /(7)(\d{3})(\d{3})(\d{2})(\d{2})/,
                        replace: '$1($2)$3-$4-$5',
                        maskinput: '9(999)999-99-99'
                    },
                    {
                        mask: '374',
                        size: 11,
                        country: 'Армения',
                        code: 'am',
                        regexp: /(374)(\d{2})(\d{3})(\d{3})/,
                        replace: '$1-$2-$3-$4',
                        maskinput: '999-99-999-999'
                    },
                    {
                        mask: '994',
                        size: 12,
                        country: 'Азейбаржан',
                        code: 'az',
                        regexp: /(994)(\d{2})(\d{3})(\d{2})(\d{2})/,
                        replace: '$1-$2-$3-$4-$5',
                        maskinput: '999-99-999-99-99'
                    },
                    {
                        mask: '995',
                        size: 12,
                        country: 'Грузия',
                        code: 'ge',
                        regexp: /(995)(\d{3})(\d{3})(\d{3})/,
                        replace: '$1($2)$3-$4',
                        maskinput: '999(999)999-999'
                    },
                    {
                        mask: '998',
                        size: 12,
                        country: 'Узбекистан',
                        code: 'uz',
                        regexp: /(998)(\d{2})(\d{3})(\d{4})/,
                        replace: '$1-$2-$3-$4',
                        maskinput: '999-99-999-9999'
                    },
                    {
                        mask: '375',
                        size: 12,
                        country: 'Беларусь',
                        code: 'by',
                        regexp: /(375)(\d{2})(\d{3})(\d{2})(\d{2})/,
                        replace: '$1($2)$3-$4-$5',
                        maskinput: '999(99)999-99-99'
                    },
                    {
                        mask: '372',
                        size: 10,
                        country: 'Эстония',
                        code: 'ee',
                        regexp: /(372)(\d{3})(\d{4})/,
                        replace: '$1-$2-$3',
                        maskinput: '999-999-9999'
                    },
                    {
                        mask: '371',
                        size: 11,
                        country: 'Латвия',
                        code: 'lv',
                        regexp: /(371)(\d{3})(\d{3})(\d{2})/,
                        replace: '$1-$2-$3-$4',
                        maskinput: '999-999-999-99'
                    },
                    {
                        mask: '370',
                        size: 11,
                        country: 'Литва',
                        code: 'lt',
                        regexp: /(370)(\d{2})(\d{3})(\d{3})/,
                        replace: '$1($2)$3-$4',
                        maskinput: '999(99)999-999'
                    },
                    {
                        mask: '373',
                        size: 11,
                        country: 'Молдова',
                        code: 'md',
                        regexp: /(373)(\d{4})(\d{4})/,
                        replace: '$1-$2-$3',
                        maskinput: '999-9999-9999'
                    },
                    {
                        mask: '996',
                        size: 12,
                        country: 'Киргизия',
                        code: 'kg',
                        regexp: /(996)(\d{3})(\d{3})(\d{3})/,
                        replace: '$1($2)$3-$4',
                        maskinput: '999(999)999-999'
                    },
                    {
                        mask: '993',
                        size: 11,
                        country: 'Туркмения',
                        code: 'tm',
                        regexp: /(993)(\d{1})(\d{3})(\d{4})/,
                        replace: '$1-$2-$3-$4',
                        maskinput: '999-9-999-9999'
                    },
                    {
                        mask: '380',
                        size: 12,
                        country: 'Украина',
                        code: 'ua',
                        regexp: /(380)(\d{2})(\d{3})(\d{2})(\d{2})/,
                        replace: '$1($2)$3-$4-$5',
                        maskinput: '999(99)999-99-99'
                    }
                ];
                let isCheck = false;
                let result = [];
                let temp_result = [];
                let k = 5;
                let returnValue = null;
                let checkInArray = function () {
                    isCheck = true;
                    result = [];
                    for (let i = 0; i < arr.length; i++) {
                        let n = parseInt(number).toString();
                        let t = n.substring(0, k);
                        let re = new RegExp("^" + arr[i].mask);
                        if (re.test(t) && ((nochecksize) ? true : n.length == arr[i].size)) {
                            result.push(arr[i]);
                        }
                    }
                    check();
                };
                let check = function () {
                    if (!isCheck) {
                        checkInArray();
                    } else if (result.length > 1 && k > 0) {
                        temp_result = result;
                        k--;
                        checkInArray();
                    } else if (result.length == 1) {
                        returnValue = result[0];
                    } else {
                        result = temp_result;
                        if (result.length == 0) {
                            returnValue = null;
                        } else {
                            returnValue = null;
                        }
                    }
                };
                check();
                return returnValue;
            },
            convert: function (phone, show_flag, as_string) {
                let ph = phone.replace(/[^0-9]/g, '');
                let obj = this .checkPhone(ph);
                if (obj) {
                    if (show_flag) {
                        return "<span class='phone-number-converted " + obj.code + "' title='" + obj.country + "'>" + ph.replace(obj.regexp, "+" + obj.replace) + "</span>";
                    } else if (as_string) {
                        return ph.replace(obj.regexp, "+" + obj.replace);
                    } else {
                        return "<span title='" + obj.country + "'>" + ph.replace(obj.regexp, "+" + obj.replace) + "</span>";
                    }
                } else {
                    return ph;
                }
            }
        }
    };
})();