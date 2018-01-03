/**
 *
 * @type {{user_birthday}}
 */
TreeForm.Format = (function () {
    return {
        user_birthday: function (data) {
            let date = '';
            if (data['dtBirthday']) {
                if (data['showBirthday']) {
                    switch (data['showBirthday']) {
                        case '0':
                            date = 'xx.xx.xxxx';
                            break;
                        case '1':
                            date = data['dtBirthday'];
                            break;
                        case '2':
                            date = moment(data['dtBirthday'], 'DD.MM.YYYY').format('DD.MM') + '.xxxx';
                            break;
                    }
                } else {
                    date = data['dtBirthday'];
                }
            }
            return date;
        }
    };
})();