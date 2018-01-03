/**
 *
 * @type {{searchInput, simpleInput, button, checkbox, radio, textarea}}
 */
var Elements = (function () {
    return {
        /**
         * поиск
         * @param id
         * @param keyup
         */
        searchInput: function (id, keyup) {
            let div = $(Template.render('elements', 'search', {id: id}));
            let input = div.find('.input');
            let clear = div.find('.elm-search-clear');
            input.off('keyup').on('keyup', function () {
                let val = input.val();
                switch (true) {
                    case val == '':
                        clear.hide();
                        break;
                    case val != '':
                        clear.show();
                        break;
                }
                keyup(val, input);
            });
            clear.off('click').on('click', function () {
                input.val('').trigger('keyup');
            });
            return div.data({input: input, clear: clear});
        },
        /**
         * текстовое поле
         * @param id
         * @param placeholder
         */
        simpleInput: function (id, placeholder, additional_class) {
            let div = $(Template.render('elements', 'input', {
                id: id, placeholder: placeholder,
                additional_class: additional_class
            }));
            let input = div.find('.input');
            return div.data({input: input});
        },
        /**
         * кнопка
         * @param id
         * @param text
         * @param additional_class
         */
        button: function (id, text, additional_class) {
            let div = $(Template.render('elements', 'button', {
                id: id,
                text: text,
                additional_class: additional_class
            }));
            return div.data({button: div});
        },
        /**
         * чекбокс
         * @param id
         * @param text
         * @param state
         * @param additional_class
         */
        checkbox: function (id, text, state, additional_class) {
            let div = $(Template.render('elements', 'checkbox', {
                id: id,
                text: text,
                additional_class: additional_class
            }));
            let checkbox = $('input[type=checkbox]', div).attr('checked', state.toString().toBoolean()).prop('checked', state.toString().toBoolean());
            return div.data({checkbox: checkbox});
        },
        /**
         * комбобокс
         * @param id
         * @param array_of_elements
         * @param default_value
         * @param additional_class
         */
        radio: function (id, array_of_elements, default_value, additional_class) {
            let div = $(Template.render('elements', 'radio', {
                name: id,
                array_of_elements: array_of_elements,
                additional_class: additional_class
            }));
            $('#radio__' + default_value, div).prop('checked', true);
            return div.data({});
        },
        /**
         * текстовое поле
         * @param id
         * @param text
         * @param placeholder
         * @param additional_class
         */
        textarea: function (id, text, placeholder, additional_class) {
            let div = $(Template.render('elements', 'textarea', {
                id: id,
                text: text,
                placeholder: placeholder,
                additional_class: additional_class
            }));
            return div.data({textarea: div.find('.textarea')});
        },
    }
})();