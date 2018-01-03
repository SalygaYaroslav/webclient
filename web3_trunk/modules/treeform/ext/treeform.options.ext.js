TreeForm.Options = (function () {
    let local = {};
    let self = {
        user_show_birthday: function () {
            return [
                {value: '0', text: 'Не показывать', dont_show: true},
                {value: '1', text: 'Показывать', dont_show: true},
                {value: '2', text: 'Показывать только дату и месяц', dont_show: true}
            ];
        },
        user_gender: function () {
            return [
                {value: '-1', text: 'Не выбрано', dont_show: true},
                {value: '0', text: 'Женский'},
                {value: '1', text: 'Мужской'}
            ];
        },
        user_political: function () {
            return [
                {value: '0', text: 'Не выбрано', dont_show: true},
                {value: '1', text: 'Индифферентные'},
                {value: '2', text: 'Коммунистические'},
                {value: '3', text: 'Социалистические'},
                {value: '4', text: 'Умеренные'},
                {value: '5', text: 'Либеральные'},
                {value: '6', text: 'Консервативные'},
                {value: '7', text: 'Монархические'},
                {value: '8', text: 'Ультраконсервативные'},
            ];
        },
        user_marstate: function () {
            return [
                {value: '0', text: 'Не женат / Не замужем'},
                {value: '1', text: 'В активном поиске'},
                {value: '2', text: 'Все сложно'},
                {value: '3', text: 'Есть подруга / друг'},
                {value: '4', text: 'Помолвлен(а)'},
                {value: '5', text: 'Женат / Замужем'}
            ];
        },
        crm_types: function () {
            return [
                {value: 'ftFloat', text: 'Вещественное число'},
                {value: 'ftCombobox', text: 'Выпадающий список'},
                {value: 'ftCalc', text: 'Вычисляемое'},
                {value: 'ftDateTime', text: 'Дата и время'},
                {value: 'ftImage', text: 'Изображение'},
                {value: 'ftString', text: 'Строка'},
                {value: 'ftText', text: 'Текст'},
                {value: 'ftFile', text: 'Файл'},
                {value: 'ftInt', text: 'Число'},
                {value: 'ftLookup', text: 'Связанное поле'},
                {value: 'ftCheckbox', text: 'Логическое'}
            ];
        },
        crm_text_format: function () {
            return [
                {value: '0', text: '[Не выбрано]'},
                {value: 'call-phone', text: 'Позвонить, отправить SMS'},
                {value: 'is-mail', text: 'Отправить письмо'},
                {value: 'allowed_phone', text: 'Форматирование номера'},
                {value: 'allowed_requisites', text: 'Реквизиты'},
                {value: 'auto-date', text: 'Добавлять текущую дату в новое поле'}
            ];
        },
        crm_string_format: function () {
            return [
                {value: '0', text: '[Не выбрано]'},
                {value: 'call-phone', text: 'Позвонить, отправить SMS'},
                {value: 'is-mail', text: 'Отправить письмо'},
                {value: 'allowed_phone', text: 'Форматирование номера'},
                {value: 'auto-date', text: 'Добавлять текущую дату в новое поле'},
                {value: 'location', text: 'Местоположение'},
                {value: 'search', text: 'Найти'}
            ];
        },
        crm_datetime_format: function () {
            return [
                {value: 'datetime', text: 'Дата и время в одном поле'},
                {value: 'datetime_separated', text: 'Дата и время в разных полях'},
                {value: 'date', text: 'Дата'},
                {value: 'time', text: 'Время'}
            ];
        },
        crm_combobox_types: function () {
            return [
                {value: '0', text: 'Значения'},
                {value: 'users', text: 'Пользователи'},
                {value: 'groups', text: 'Группы'},
                {value: 'contacts', text: 'Контакты'},
                {value: 'tasks', text: 'Задачи'}
            ];
        },
    };
    return self;
})();