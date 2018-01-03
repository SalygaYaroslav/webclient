Chat.User = function (entity) {
    return {
        id: entity.id,
        name: entity.name,
        entity: entity,
        status: false,
        resource: {},
        _status: function (type) {
            this.status = (type + '').toBoolean();
        },
        _resource: function (res, type) {
            switch (true) {
                case (typeof res == 'undefined' && typeof type == 'undefined'):
                    return this.resource;
                    break;
                case (typeof res != 'undefined' && typeof type == 'undefined' && typeof this.resource[res] != 'undefined'):
                    return this.resource[res];
                    break;
                case (typeof res != 'undefined' && typeof type != 'undefined'):
                    switch (type) {
                        case true:
                            this.resource[res] = type;
                            break;
                        case false:
                            if (typeof this.resource[res] != 'undefined') {
                                delete this.resource[res];
                            }
                            break;
                    }
                    break;
            }
        }
    };
};