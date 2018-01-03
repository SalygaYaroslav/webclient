/**
 * Модуль дл обработки данных
 * @returns {{setFromXml: setFromXml, setFromText: setFromText, setFromObject: setFromObject}}
 * @constructor
 */
var XmlObject = function () {
    /** private **/
    let data_text = '';
    let data_xml = null;
    let data_object = {};
    /**
     * xml2text
     * @param xml
     * @returns {*}
     */
    let convertXmlToText = function (xml) {
        let xml_string;
        if (window.ActiveXObject) {
            xml_string = xml.xml;
        } else {
            xml_string = (new XMLSerializer()).serializeToString(xml);
        }
        return xml_string;
    };
    /**
     * xml2object
     * @param xml
     */
    let convertXmlToObject = function (xml) {
        return x2js.xml2json(xml);
    };
    /**
     * text2zml
     * @param text
     */
    let convertTextToXml = function (text) {
        return x2js.parseXmlString(text);
    };
    /**
     * text2object
     * @param text
     */
    let convertTextToObject = function (text) {
        return x2js.xml_str2json(text);
    };
    /**
     * object2xml
     * @param object
     */
    let convertObjectToXml = function (object) {
        return x2js.json2xml(object);
    };
    /**
     * object2text
     * @param object
     */
    let convertObjectToText = function (object) {
        return x2js.json2xml_str(object);
    };
    /** public **/
    return {
        /**
         * задаем из xml
         * @param xml
         */
        setFromXml: function (xml) {
            data_xml = xml;
            data_text = convertXmlToText(xml);
            data_object = convertXmlToObject(xml);
        },
        /**
         * задаем из текста
         * @param text
         */
        setFromText: function (text) {
            data_text = text;
            data_xml = convertTextToXml(text);
            data_object = convertTextToObject(text);
        },
        /**
         * задаем из объекта
         * @param object
         */
        setFromObject: function (object) {
            data_object = object;
            data_xml = convertObjectToXml(object);
            data_text = convertObjectToText(object);
        },
        /**
         * вернем текстом
         * @returns {string}
         */
        text: function () {
            return data_text;
        },
        /**
         * вернем объектом
         * @returns {null|Object}
         */
        object: function () {
            return data_object.response;
        },
        /**
         * вернем как xml
         * @returns {*|jQuery|HTMLElement}
         */
        xml: function () {
            return $('response', data_xml);
        },
    };
};