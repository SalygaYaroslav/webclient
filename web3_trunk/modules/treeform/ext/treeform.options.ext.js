TreeForm.Options = (function () {
    let local = {};
    let self = {
        user_show_birthday: function () {
            return [
                {value: '0', text: '�� ����������', dont_show: true},
                {value: '1', text: '����������', dont_show: true},
                {value: '2', text: '���������� ������ ���� � �����', dont_show: true}
            ];
        },
        user_gender: function () {
            return [
                {value: '-1', text: '�� �������', dont_show: true},
                {value: '0', text: '�������'},
                {value: '1', text: '�������'}
            ];
        },
        user_political: function () {
            return [
                {value: '0', text: '�� �������', dont_show: true},
                {value: '1', text: '��������������'},
                {value: '2', text: '����������������'},
                {value: '3', text: '����������������'},
                {value: '4', text: '���������'},
                {value: '5', text: '�����������'},
                {value: '6', text: '��������������'},
                {value: '7', text: '�������������'},
                {value: '8', text: '��������������������'},
            ];
        },
        user_marstate: function () {
            return [
                {value: '0', text: '�� ����� / �� �������'},
                {value: '1', text: '� �������� ������'},
                {value: '2', text: '��� ������'},
                {value: '3', text: '���� ������� / ����'},
                {value: '4', text: '���������(�)'},
                {value: '5', text: '����� / �������'}
            ];
        },
        crm_types: function () {
            return [
                {value: 'ftFloat', text: '������������ �����'},
                {value: 'ftCombobox', text: '���������� ������'},
                {value: 'ftCalc', text: '�����������'},
                {value: 'ftDateTime', text: '���� � �����'},
                {value: 'ftImage', text: '�����������'},
                {value: 'ftString', text: '������'},
                {value: 'ftText', text: '�����'},
                {value: 'ftFile', text: '����'},
                {value: 'ftInt', text: '�����'},
                {value: 'ftLookup', text: '��������� ����'},
                {value: 'ftCheckbox', text: '����������'}
            ];
        },
        crm_text_format: function () {
            return [
                {value: '0', text: '[�� �������]'},
                {value: 'call-phone', text: '���������, ��������� SMS'},
                {value: 'is-mail', text: '��������� ������'},
                {value: 'allowed_phone', text: '�������������� ������'},
                {value: 'allowed_requisites', text: '���������'},
                {value: 'auto-date', text: '��������� ������� ���� � ����� ����'}
            ];
        },
        crm_string_format: function () {
            return [
                {value: '0', text: '[�� �������]'},
                {value: 'call-phone', text: '���������, ��������� SMS'},
                {value: 'is-mail', text: '��������� ������'},
                {value: 'allowed_phone', text: '�������������� ������'},
                {value: 'auto-date', text: '��������� ������� ���� � ����� ����'},
                {value: 'location', text: '��������������'},
                {value: 'search', text: '�����'}
            ];
        },
        crm_datetime_format: function () {
            return [
                {value: 'datetime', text: '���� � ����� � ����� ����'},
                {value: 'datetime_separated', text: '���� � ����� � ������ �����'},
                {value: 'date', text: '����'},
                {value: 'time', text: '�����'}
            ];
        },
        crm_combobox_types: function () {
            return [
                {value: '0', text: '��������'},
                {value: 'users', text: '������������'},
                {value: 'groups', text: '������'},
                {value: 'contacts', text: '��������'},
                {value: 'tasks', text: '������'}
            ];
        },
    };
    return self;
})();