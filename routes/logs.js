const express = require('express'),
    router = express.Router(),
    hdb_callout = require('../utility/harperDBCallout'),
    reduceTypeLogs = require('../utility/reduceTypeLogs'),
    isAuthenticated = require('../utility/checkAuthenticate'),
    mapDynamicToStableObject = require('../utility/mapDynamicToStableObject');


router.get('/', function (req, res) {
    if (!req.user || !req.user.active || !req.user.password) {
        return res.redirect('/login?ref=logs');
    }

    var operation = {
        "operation": "read_log",
        "limit": 500,
        "start": 0,
        // "from": "2017-07-10",
        // "until": "2019-07-11",
        "order": "desc"
    };

    var call_object = {
        username: req.user.username,
        password: req.user.password,
        endpoint_url: req.user.endpoint_url,
        endpoint_port: req.user.endpoint_port

    };

    hdb_callout.callHarperDB(call_object, operation).then(logs => {

        return res.render('logs', {
            user: req.user,
            logs: JSON.stringify(mapDynamicToStableObject(reduceTypeLogs(logs))),
            error: err,
            nameOfUser: req.user.username
        });
    });

});

router.post('/search', isAuthenticated, function (req, res) {

    var connection = {
        username: req.user.username,
        password: req.user.password,
        endpoint_url: req.user.endpoint_url,
        endpoint_port: req.user.endpoint_port
    };

    hdb_callout.callHarperDB(connection, JSON.parse(req.body.operation)).then(result => {
        var obj = {
            result: mapDynamicToStableObject(reduceTypeLogs(result))
        }        
        return res.status(200).send(obj);
    }).catch(err => res.status(400).send(result));

})

router.get('/individual/:logDetail', isAuthenticated, function (req, res) {    
    var decoded = new Buffer(req.params.logDetail, 'base64').toString('ascii');
    res.render('log_individual', {
        nameOfUser: req.user.username,
        log: JSON.parse(decoded)
    });
});

router.get('/search', isAuthenticated, function (req, res) {
    res.render('logs_advance', {
        nameOfUser: req.user.username
    });
});

module.exports = router;