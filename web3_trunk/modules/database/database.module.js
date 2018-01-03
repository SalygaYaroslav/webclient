window.Database = (function () {
    let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    let IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    let local = {
        version: 1,
        dbname: 'webclient'
    };
    let self = {
        connectToDb: function (callback) {
            let request = indexedDB.open(local.dbname, local.version);
            request.onerror = function (err) {
                console.error(err);
            };
            // При успешном открытии вызвали коллбэк передав ему объект БД
            request.onsuccess = function () {
                console.warn('successfully connect to DB');
                callback(request.result);
            };
            // Если БД еще не существует, то создаем хранилище объектов.
            request.onupgradeneeded = function (event) {
                console.warn('DB is upgraded from version ' + event.oldVersion + ' to ' + event.newVersion);
                self.createDataBase(event);
            };
        },
        createDataBase: function (event) {
            event.currentTarget.result.createObjectStore('organizations', {keyPath: 'id'});
            event.currentTarget.result.createObjectStore('users', {keyPath: 'id'});
            event.currentTarget.result.createObjectStore('projects', {keyPath: 'id'});
            event.currentTarget.result.createObjectStore('tasks', {keyPath: 'id'});
            event.currentTarget.result.createObjectStore('categories', {keyPath: 'id'});
            event.currentTarget.result.createObjectStore('groups', {keyPath: 'id'});
            event.currentTarget.result.createObjectStore('tables', {keyPath: 'id'});
            console.log(event);

        },
        init: function (callback) {
            self.connectToDb(callback);
        },
        insertEntity: function (entity_name, entity) {
            self.connectToDb(function (db) {
                console.log(db);
                let transaction = db.transaction(entity_name, 'readwrite');
                let request = transaction.objectStore(entity_name).put(entity);
                request.onerror = function (err) {
                    console.log(err);
                };
                request.onsuccess = function () {
                    return request.result;
                }
            });
        },
        getEntity: function (entity_name, key) {
            self.connectToDb(function (db) {
                console.log(db);
                let transaction = db.transaction(entity_name, 'readwrite');
                let request = transaction.objectStore(entity_name).get(key);
                request.onerror = function (err) {
                    console.log(err);
                };
                request.onsuccess = function () {
                    console.log(request.result);
                    return request.result;
                }
            });
        },

    };
    return self;
})();