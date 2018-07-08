const express = require('express'),
    router = express.Router(),
    hdb_callout = require('../utility/harperDBCallout'),
    reduceTypeLogs = require('../utility/reduceTypeLogs'),
    isAuthenticated = require('../utility/checkAuthenticate'),
    CryptoJS = require("crypto-js"),
    favorite = require('../utility/favoritesQuery'),
    guid = require('guid');

const secretkey = 'gettingLiveLinkOnly123!!!';


router.post('/save', isAuthenticated, function (req, res) {
    var new_id = guid.create();
    var en_url = encryptLivelink(req, new_id);
    favorite.setLiveLink(req, en_url, new_id).then((result) => {
        return res.status(200).send(result);
    })
})

router.put('/update/:id', isAuthenticated, function (req, res) {        
    favorite.updateLiveLink(req , req.params.id).then((result) => {
        return res.status(200).send(result);
    })
})

router.get('/livelinklist', isAuthenticated, function (req, res) {
    favorite.getLivelink(req).then(recents => {
        return res.status(200).send(recents);
    })
})

router.post('/getlivelink', isAuthenticated, function (req, res) {

    var en_url = encryptLivelink(req);
    return res.status(200).send(en_url);

})

router.put('/unfavorite/:id/:isFavorited', isAuthenticated, function (req, res) {
    var call_object = {
        username: req.user.username,
        password: req.user.password,
        endpoint_url: req.user.endpoint_url,
        endpoint_port: req.user.endpoint_port
    };
    var operation = {
        "operation": "update",
        "schema": "harperdb_studio",
        "table": "livelink",
        "records": [
            {
                "id": req.params.id,
                "isFavorited": req.params.isFavorited
            }

        ]

    }

    hdb_callout.callHarperDB(call_object, operation).then(result => res.status(200).send(result))

})

router.get('/public/:key', function (req, res) {
    try {
        var decode64 = Buffer.from(req.params.key, 'base64').toString('ascii');
        var bytes = CryptoJS.AES.decrypt(decode64, secretkey);
        var decryptedObject = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

        var call_object = {
            username: decryptedObject.un,
            password: decryptedObject.pw,
            endpoint_url: decryptedObject.eurl,
            endpoint_port: decryptedObject.epp
        };

        var operation = {
            operation: 'sql',
            sql: "SELECT * FROM harperdb_studio.livelink WHERE id ='" + decryptedObject.id + "' "
        };

        hdb_callout.callHarperDB(call_object, operation).then(sqlLivelink => {
            if (sqlLivelink.length > 0) {
                var operation2 = {
                    operation: 'sql',
                    sql: sqlLivelink[0].sql
                }

                hdb_callout.callHarperDB(call_object, operation2).then(sqlData => {
                    res.render('live_link', {
                        graphDetail: JSON.stringify({
                            data: sqlData,
                            options: sqlLivelink[0].options,
                            graphType: sqlLivelink[0].graphType,
                        }),
                        notes: sqlLivelink[0].notes,
                        livelinkName: sqlLivelink[0].livelinkName,
                        isFavorited: sqlLivelink[0].isFavorited
                        
                    });
                });
            } else {
                res.render('live_link', {
                    error: 'live link is not found'
                });
            }
        });
    } catch (err) {
        res.render('live_link', {
            error: err.message
        });
    }

})

router.get('/delete/:id', isAuthenticated, function (req, res) {
    var call_object = {
        username: req.user.username,
        password: req.user.password,
        endpoint_url: req.user.endpoint_url,
        endpoint_port: req.user.endpoint_port

    };
    var operation = {
        "operation": "delete",
        "schema": "harperdb_studio",
        "table": "livelink",
        "hash_values": [req.params.id]

    }
    hdb_callout.callHarperDB(call_object, operation).then(result => res.status(200).send(result))
})

var encryptLivelink = (req, id) => {
    var obj = {
        un: req.user.username,
        pw: req.user.password,
        eurl: req.user.endpoint_url,
        epp: req.user.endpoint_port,
        id: id
    }

    var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(obj), secretkey);
    var en_url = Buffer.from(ciphertext.toString()).toString('base64');
    return en_url;
}

module.exports = router;