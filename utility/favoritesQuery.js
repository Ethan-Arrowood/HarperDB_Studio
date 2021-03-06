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
        hdb_callout.callHarperDB(call_object, operation, function (err, result) {
            if (err || result.error) {
                createUserFavoriteTable(req, res).then(() => {
                    hdb_callout.callHarperDB(call_object, operation, function (err2, result2) {
                        resolve(result2);
                    });

                })
            }
            resolve(result);
        });
    })
}

var setLiveLink = function (req, en_url) {
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
            id: guid.create(),
            username: req.user.username,
            livelinkName: req.body.livelinkName,
            sql: req.body.sql,
            
        }

        var operation = {
            operation: 'insert',
            schema: 'harperdb_studio',
            table: 'livelink',
            records: [record]
        };
        hdb_callout.callHarperDB(call_object, operation, function (err, result) {
            if (err || result.error) {
                createLivelinkTable(req, res).then(() => {
                    hdb_callout.callHarperDB(call_object, operation, function (err2, result2) {
                        resolve(result2);
                    });

                })
            }else 
                resolve(result);
        });
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

        hdb_callout.callHarperDB(call_object, operation, function (err, result) {
            if (err || result.error) {
                createUserFavoriteTable(req, res).then(() => {
                    hdb_callout.callHarperDB(call_object, operation, function (err2, result2) {
                        resolve(result2);
                    });
                })

            } else {
                resolve(result);
            }

        });
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

        hdb_callout.callHarperDB(call_object, operation, function (err, result) {
            if (err || result.error) {
                console.log(err)

                createLivelinkTable(req).then(() => {

                    hdb_callout.callHarperDB(call_object, operation, function (err2, result2) {
                        resolve(result2);
                    });
                })

            } else {
                resolve(result);
            }

        });
    })

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
            hdb_callout.callHarperDB(call_object, operation, function (err, result) {
                if (err || result.error) {
                    resolve(result);
                }
                resolve(result);
            });
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
            hdb_callout.callHarperDB(call_object, operation, function (err, result) {
                if (err || result.error) {
                    resolve(result);
                }
                resolve(result);
            });
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

        hdb_callout.callHarperDB(call_object, operation, function (err, result) {
            if (err || result.error) {
                resolve(err);

            }
            resolve(result);
        });
    })

}

module.exports = {
    setFavorites: setFavorites,
    createFavoriteSearchSchema: createFavoriteSearchSchema,
    createUserFavoriteTable: createUserFavoriteTable,
    getFavorites: getFavorites,
    setLiveLink: setLiveLink,
    getLivelink: getLivelink
}