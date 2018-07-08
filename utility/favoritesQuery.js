var hdb_callout = require('./harperDBCallout');
var guid = require('guid');

var setFavorites = function (req, res, favoriteObj) {
    return new Promise(function (resolve) {
        var call_object = {
            username: req.user.username,
            password: req.user.password,
            endpoint_url: req.user.endpoint_url,
            endpoint_port: req.user.endpoint_port
        };

        var record = {
            sql: favoriteObj.sql,
            name: favoriteObj.name,
            note: favoriteObj.note,
            username: req.user.username,
            date: new Date(),
            id: guid.create()
        }

        var operation = {
            operation: 'insert',
            schema: 'harperdb_studio',
            table: 'query',
            records: [record]
        };
        hdb_callout.callHarperDB(call_object, operation)
            .then(result => resolve(result))
            .catch(err => {
                createUserFavoriteTable(req, res).then(() => {
                    hdb_callout.callHarperDB(call_object, operation)
                        .then(result2 => resolve(result2))
                        .catch(err2 => reject(err2))
                })
            })
    })
}

var setLiveLink = function (req, en_url, id) {
    return new Promise(function (resolve) {
        var call_object = {
            username: req.user.username,
            password: req.user.password,
            endpoint_url: req.user.endpoint_url,
            endpoint_port: req.user.endpoint_port
        };

        var record = {
            en_url: en_url,
            date: new Date(),
            id: id.value,
            username: req.user.username,
            livelinkName: req.body.livelinkName,
            sql: req.body.sql,
            options: req.body.options,
            livelinkName: req.body.livelinkName,
            notes: req.body.notes,
            graphType: req.body.graphType,
            isFavorited: req.body.isFavorited

        }

        var operation = {
            operation: 'insert',
            schema: 'harperdb_studio',
            table: 'livelink',
            records: [record]
        };
        hdb_callout.callHarperDB(call_object, operation)
            .then(result => resolve(result))
            .catch(err => {
                createLivelinkTable(req).then(() => {
                    hdb_callout.callHarperDB(call_object, operation)
                        .then(result2 => resolve(result2))
                        .catch(err2 => reject(err2))
                })
            })
    })
}

var updateLiveLink = function (req, id) {
    return new Promise(function (resolve) {
        var call_object = {
            username: req.user.username,
            password: req.user.password,
            endpoint_url: req.user.endpoint_url,
            endpoint_port: req.user.endpoint_port
        };

        var record = {
            id: id,
            date: new Date(),
            username: req.user.username,
            livelinkName: req.body.livelinkName,
            sql: req.body.sql,
            options: req.body.options,
            livelinkName: req.body.livelinkName,
            notes: req.body.notes,
            graphType: req.body.graphType,
            isFavorited: true
        }

        var operation = {
            operation: 'update',
            schema: 'harperdb_studio',
            table: 'livelink',
            records: [record]
        };
        hdb_callout.callHarperDB(call_object, operation)
            .then(result => resolve(result))
            .catch(err => reject(err))
    })
}

var getFavorites = function (req, res) {
    return new Promise(function (resolve) {
        var call_object = {
            username: req.user.username,
            password: req.user.password,
            endpoint_url: req.user.endpoint_url,
            endpoint_port: req.user.endpoint_port
        };

        var operation = {
            operation: 'sql',
            sql: "SELECT * FROM harperdb_studio.query WHERE username = '" + req.user.username + "' ORDER BY date DESC  LIMIT 10"
        };

        hdb_callout.callHarperDB(call_object, operation)
            .then(result => resolve(result))
            .catch(err => {
                createLivelinkTable(req).then(() => {
                    hdb_callout.callHarperDB(call_object, operation)
                        .then(result2 => resolve(result2))
                        .catch(err2 => reject(err2))
                })
            })
    })

}

var getLivelink = function (req) {
    return new Promise(function (resolve) {
        var call_object = {
            username: req.user.username,
            password: req.user.password,
            endpoint_url: req.user.endpoint_url,
            endpoint_port: req.user.endpoint_port
        };

        var operation = {
            operation: 'sql',
            sql: "SELECT * FROM harperdb_studio.livelink WHERE username = '" + req.user.username + "' ORDER BY date DESC  LIMIT 10"
        };

        hdb_callout.callHarperDB(call_object, operation)
            .then(result => resolve(result))
            .catch(err => {
                createLivelinkTable(req).then(() => {
                    hdb_callout.callHarperDB(call_object, operation)
                        .then(result2 => resolve(result2))
                        .catch(err2 => reject(err2))
                })
            })
    })

}

var getLivelinkById = function (req, id) {
    return new Promise(function (resolve) {
        var call_object = {
            username: req.user.username,
            password: req.user.password,
            endpoint_url: req.user.endpoint_url,
            endpoint_port: req.user.endpoint_port
        };

        var operation = {
            operation: 'sql',
            sql: "SELECT * FROM harperdb_studio.livelink WHERE id = '" + id + "'"
        };
        hdb_callout.callHarperDB(call_object, operation)
            .then(result => {
                if (result.length > 0) resolve(result[0])
                else resolve(result)
            })
            .catch(err => reject(err))
    });
}


var createUserFavoriteTable = function (req, res) {
    return new Promise(function (resolve) {
        var call_object = {
            username: req.user.username,
            password: req.user.password,
            endpoint_url: req.user.endpoint_url,
            endpoint_port: req.user.endpoint_port

        };

        var operation = {
            operation: 'create_table',
            schema: 'harperdb_studio',
            table: 'query',
            "hash_attribute": "id",

        };
        createFavoriteSearchSchema(req, res).then(() => {
            hdb_callout.callHarperDB(call_object, operation)
                .then(result => resolve(result))
                .catch(err => reject(err))
        })


    });
}

var createLivelinkTable = function (req) {
    return new Promise(function (resolve) {
        var call_object = {
            username: req.user.username,
            password: req.user.password,
            endpoint_url: req.user.endpoint_url,
            endpoint_port: req.user.endpoint_port

        };

        var operation = {
            operation: 'create_table',
            schema: 'harperdb_studio',
            table: 'livelink',
            "hash_attribute": "id",

        };
        createFavoriteSearchSchema(req).then(() => {
            hdb_callout.callHarperDB(call_object, operation)
                .then(result => resolve(result))
                .catch(err => reject(err))
        })


    });
}

var createFavoriteSearchSchema = function (req) {
    return new Promise(function (resolve) {
        var call_object = {
            username: req.user.username,
            password: req.user.password,
            endpoint_url: req.user.endpoint_url,
            endpoint_port: req.user.endpoint_port

        };

        var operation = {
            operation: 'create_schema',
            schema: 'harperdb_studio'
        };

        hdb_callout.callHarperDB(call_object, operation)
            .then(result => resolve(result))
            .catch(err => reject(err))
    })

}

module.exports = {
    setFavorites: setFavorites,
    createFavoriteSearchSchema: createFavoriteSearchSchema,
    createUserFavoriteTable: createUserFavoriteTable,
    getFavorites: getFavorites,
    setLiveLink: setLiveLink,
    getLivelink: getLivelink,
    getLivelinkById: getLivelinkById,
    updateLiveLink: updateLiveLink
}