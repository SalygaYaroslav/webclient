/**
 * делаем заглавной буквой строку
 * @returns {string}
 */
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
/**
 *
 * @returns {boolean}
 */
String.prototype.toBoolean = function () {
    switch (this.toLowerCase().trim()) {
        case 'true':
        case 'yes':
        case '1':
            return true;
        case 'false':
        case 'no':
        case '0':
        case null:
            return false;
        default:
            return Boolean(this);
    }
};
/**
 * удал€ем в массиве заданные элементы
 * @param deleteValue
 * @returns {Array}
 */
Array.prototype.clean = function (deleteValue) {
    for (let i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};
/**
 *
 * @param index
 * @returns {Array}
 */
Array.prototype.cleanByIndex = function (index) {
    this.splice(index, 1);
    return this;
};
/**
 *
 * @returns {Array}
 */
Array.prototype.clearEmpty = function () {
    let result = [];
    for (let i = 0; i < this.length; i++) {
        if (i in this && this[i] != '' && this[i] != 'undefined') {
            result.push(this[i]);
        }
    }
    return result;
};
/**
 * одинаковые элементы
 * @param second
 * @returns {Array}
 */
Array.prototype.duplicate = function (second) {
    let first = this;
    let result = [];
    let first_ = {};
    let second_ = {};
    for (let index = 0; index < first.length; index++) first_[first[index]] = !0;
    for (index = 0; index < second.length; index++) second_[second[index]] = !0;
    for (let next in first_) second_[next] && result.push(next);
    return result;
};
/**
 * различи€
 * @param array
 * @returns {Array.<*>}
 */
Array.prototype.difference = function (array) {
    return this.filter(function (i) {
        return array.indexOf(i) < 0;
    });
};

/**
 * ћетод убирает из текста все тэги
 * @param allowed набор дозволенных тегов
 */
String.prototype.stripTags = function (allowed) {
    if (!allowed || allowed == "all")
        allowed = "<br>";
    allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
    let tags = /<\/?([a-zA-Z!][a-zA-Z0-9]*)\b[^>]*>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi,
        style = /<style[\s\S]*>[\s\S]*<\/style>/gi;
    return this.replace(commentsAndPhpTags, '').replace(style, '').replace(tags, function ($0, $1) {
        if ($1.toLowerCase() == "style")
            $0 = '';
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
};

/**
 * ћетод обрабатывает переданный текст таким образом, что
 * ссылки, которые были остаютс€, которые не были по€вл€ютс€
 * @param text текст дл€ обработки
 */
String.prototype.parseHTMLLinks = function () {
    if (!this)
        return this;
    let text = this;
    text = " " + text + " ";
    text = text.replace(new RegExp("<", 'g'), " <");
    text = text.replace(new RegExp(">", 'g'), "> ");
    text = text.replace('&nbsp;', ' ');
    let tags = /["']{0}((https?|ftp|file):\/\/(www\.|ftp\.)?[-A-Zа-€ј-яЄ®0-9+&@#\/%=~_|$?!:,.]*[A-Zа-€ј-яЄ®0-9+&@#\/%=~_|$])[\s,.](?!<\/\s*a)/gi;

    if ($('<div>' + text + '</div>').find('a').length == 0) {
        text = text.replace(tags, '<a title="$1" class="easy-link --webfile" href="$1" target="_blank">$1</a> ');
        //≈ще парсим ссылки на простой
        let links = /(prostoy:\/\/(comment|user|contact|task|table)\/([\S]+))\s*/gi;
        text = text.replace(links, '<a href="javascript:;" title="$1" class="prostoyLink" >$1</a> ');
    }
    return text;
};

jQuery.fn.extend({
    setCaretEnd: function () {
        let pos = parseInt($(this).val().length);
        return this.each(function () {
            if ('selectionStart' in this) {
                this.selectionStart = pos;
                this.selectionEnd = pos;
            } else if (this.setSelectionRange) {
                this.setSelectionRange(pos, pos);
            } else if (this.createTextRange) {
                let range = this.createTextRange();
                range.collapse(true);
                range.moveEnd('character', pos);
                range.moveStart('character', pos);
                range.select();
            }
            $(this).focus();
        });
    }
});
String.prototype.encode = function () {
    let str = this;
    if (str != null) {
        //¬ажно! »наче можно передать число и получить не его строковый вид, а пустую строку
        str = str.toString();
        let code, encode = '';
        for (let k = 0; k < str.length; k++) {
            let eChr = escape(str.charAt(k));
            if (eChr.length == 6) {
                code = str.charAt(k).charCodeAt(0) - 848;
                switch (code) {
                    case 180 :
                        eChr = '%AA';
                        break; //™
                    case 260 :
                        eChr = '%BA';
                        break; //Ї
                    case 183 :
                        eChr = '%AF';
                        break; //ѓ
                    case 263 :
                        eChr = '%BF';
                        break; //њ
                    case 182 :
                        eChr = '%B2';
                        break; //≤
                    case 262 :
                        eChr = '%B3';
                        break; //≥
                    case 7622 :
                        eChr = '%B9';
                        break;
                    case 257 :
                        eChr = '%B8';
                        break;
                    case 177 :
                        eChr = '%A8';
                        break;
                    case 7378 :
                        eChr = '%95'; //точка, ненумерованный список из ворда
                        break;
                    case 7363 :
                        eChr = '%96'; //короткое тире из ворда
                        break;
                    case 7364:
                        eChr = '%97'; //длинное тире
                        break;
                    default :
                        eChr = '%' + code.toString(16).toUpperCase();
                        break;
                }
            }
            if (eChr == '+') {
                eChr = '%2B';
            }
            encode += eChr;
        }
        return encode;
    } else {
        return '';
    }
};
String.prototype.transEngToRus = function () {
    let text = this;
    if (!text)
        text = "";
    let first = "®…÷” ≈Ќ√Ўў«’Џ‘џ¬јѕ–ќЋƒ∆Ёя„—ћ»“№ЅёЄйцукенгшщзхъфывапролджэ€чсмитьбю~QWERTYUIOP{}ASDFGHJKL:\"ZXCVBNM<>`qwertyuiop[]asdfghjkl;'zxcvbnm,.";
    let second = "~QWERTYUIOP{}ASDFGHJKL:\"ZXCVBNM<>`qwertyuiop[]asdfghjkl;'zxcvbnm,.®…÷” ≈Ќ√Ўў«’Џ‘џ¬јѕ–ќЋƒ∆Ёя„—ћ»“№ЅёЄйцукенгшщзхъфывапролджэ€чсмитьбю";
    let exit_text = "";
    for (let i = 0; i < text.length; i++) {
        let ch = text[i];
        if (first.indexOf(ch) != -1) {
            exit_text += second[first.indexOf(ch)];
        } else {
            exit_text += ch;
        }
    }
    return exit_text;
};
jQuery.expr[':'].multilang = function (a, i, m) {
    if (jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0 || jQuery(a).text().transEngToRus().toUpperCase().indexOf(m[3].toUpperCase()) >= 0) {
        return true;
    } else {
        return false;
    }
};
String.prototype.wincode2unicode = function () {
    let str = this;
    let charmap = unescape(
        "%u0402%u0403%u201A%u0453%u201E%u2026%u2020%u2021%u20AC%u2030%u0409%u2039%u040A%u040C%u040B%u040F" +
        "%u0452%u2018%u2019%u201C%u201D%u2022%u2013%u2014%u0000%u2122%u0459%u203A%u045A%u045C%u045B%u045F" +
        "%u00A0%u040E%u045E%u0408%u00A4%u0490%u00A6%u00A7%u0401%u00A9%u0404%u00AB%u00AC%u00AD%u00AE%u0407" +
        "%u00B0%u00B1%u0406%u0456%u0491%u00B5%u00B6%u00B7%u0451%u2116%u0454%u00BB%u0458%u0405%u0455%u0457"),
        res = "";
    let code2char = function (code) {
        if (code >= 0xC0 && code <= 0xFF)
            return String.fromCharCode(code - 0xC0 + 0x0410);
        if (code >= 0x80 && code <= 0xBF)
            return charmap.charAt(code - 0x80);
        return String.fromCharCode(code);
    };
    for (let i = 0; i < str.length; i++)
        res = res + code2char(str.charCodeAt(i));
    return res;
};
String.prototype.unicode2wincode = function () {
    let str = this;
    let DMap = {
        0: 0,
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        10: 10,
        11: 11,
        12: 12,
        13: 13,
        14: 14,
        15: 15,
        16: 16,
        17: 17,
        18: 18,
        19: 19,
        20: 20,
        21: 21,
        22: 22,
        23: 23,
        24: 24,
        25: 25,
        26: 26,
        27: 27,
        28: 28,
        29: 29,
        30: 30,
        31: 31,
        32: 32,
        33: 33,
        34: 34,
        35: 35,
        36: 36,
        37: 37,
        38: 38,
        39: 39,
        40: 40,
        41: 41,
        42: 42,
        43: 43,
        44: 44,
        45: 45,
        46: 46,
        47: 47,
        48: 48,
        49: 49,
        50: 50,
        51: 51,
        52: 52,
        53: 53,
        54: 54,
        55: 55,
        56: 56,
        57: 57,
        58: 58,
        59: 59,
        60: 60,
        61: 61,
        62: 62,
        63: 63,
        64: 64,
        65: 65,
        66: 66,
        67: 67,
        68: 68,
        69: 69,
        70: 70,
        71: 71,
        72: 72,
        73: 73,
        74: 74,
        75: 75,
        76: 76,
        77: 77,
        78: 78,
        79: 79,
        80: 80,
        81: 81,
        82: 82,
        83: 83,
        84: 84,
        85: 85,
        86: 86,
        87: 87,
        88: 88,
        89: 89,
        90: 90,
        91: 91,
        92: 92,
        93: 93,
        94: 94,
        95: 95,
        96: 96,
        97: 97,
        98: 98,
        99: 99,
        100: 100,
        101: 101,
        102: 102,
        103: 103,
        104: 104,
        105: 105,
        106: 106,
        107: 107,
        108: 108,
        109: 109,
        110: 110,
        111: 111,
        112: 112,
        113: 113,
        114: 114,
        115: 115,
        116: 116,
        117: 117,
        118: 118,
        119: 119,
        120: 120,
        121: 121,
        122: 122,
        123: 123,
        124: 124,
        125: 125,
        126: 126,
        127: 127,
        1027: 129,
        8225: 135,
        1046: 198,
        8222: 132,
        1047: 199,
        1168: 165,
        1048: 200,
        1113: 154,
        1049: 201,
        1045: 197,
        1050: 202,
        1028: 170,
        160: 160,
        1040: 192,
        1051: 203,
        164: 164,
        166: 166,
        167: 167,
        169: 169,
        171: 171,
        172: 172,
        173: 173,
        174: 174,
        1053: 205,
        176: 176,
        177: 177,
        1114: 156,
        181: 181,
        182: 182,
        183: 183,
        8221: 148,
        187: 187,
        1029: 189,
        1056: 208,
        1057: 209,
        1058: 210,
        8364: 136,
        1112: 188,
        1115: 158,
        1059: 211,
        1060: 212,
        1030: 178,
        1061: 213,
        1062: 214,
        1063: 215,
        1116: 157,
        1064: 216,
        1065: 217,
        1031: 175,
        1066: 218,
        1067: 219,
        1068: 220,
        1069: 221,
        1070: 222,
        1032: 163,
        8226: 149,
        1071: 223,
        1072: 224,
        8482: 153,
        1073: 225,
        8240: 137,
        1118: 162,
        1074: 226,
        1110: 179,
        8230: 133,
        1075: 227,
        1033: 138,
        1076: 228,
        1077: 229,
        8211: 150,
        1078: 230,
        1119: 159,
        1079: 231,
        1042: 194,
        1080: 232,
        1034: 140,
        1025: 168,
        1081: 233,
        1082: 234,
        8212: 151,
        1083: 235,
        1169: 180,
        1084: 236,
        1052: 204,
        1085: 237,
        1035: 142,
        1086: 238,
        1087: 239,
        1088: 240,
        1089: 241,
        1090: 242,
        1036: 141,
        1041: 193,
        1091: 243,
        1092: 244,
        8224: 134,
        1093: 245,
        8470: 185,
        1094: 246,
        1054: 206,
        1095: 247,
        1096: 248,
        8249: 139,
        1097: 249,
        1098: 250,
        1044: 196,
        1099: 251,
        1111: 191,
        1055: 207,
        1100: 252,
        1038: 161,
        8220: 147,
        1101: 253,
        8250: 155,
        1102: 254,
        8216: 145,
        1103: 255,
        1043: 195,
        1105: 184,
        1039: 143,
        1026: 128,
        1106: 144,
        8218: 130,
        1107: 131,
        8217: 146,
        1108: 186,
        1109: 190
    };
    let L = [];
    for (let i = 0; i < str.length; i++) {
        let ord = str.charCodeAt(i);
        if (!(ord in DMap))
            throw "Character " + str.charAt(i) + " isn't supported by win1251!";
        L.push(String.fromCharCode(DMap[ord]));
    }
    return L.join('');
};
