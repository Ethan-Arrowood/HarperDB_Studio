const express = require('express'),
    router = express.Router(),
    hdb_callout = require('../utility/harperDBCallout'),
    isAuthenticated = require('../utility/checkAuthenticate'),
    mapObject = require('../utility/mapDescribeAllToAddRole');


router.get('/', isAuthenticated, function (req, res) {

    var operation = {
        operation: 'list_users'
    };
    var call_object = {
        username: req.user.username,
        password: req.user.password,
        endpoint_url: req.user.endpoint_url,
        endpoint_port: req.user.endpoint_port

    };

    hdb_callout.callHarperDB(call_object, operation).then(users => {
        // console.error(err);
        // console.log(logs);
        return res.render('security', {
            user: req.user,
            users: JSON.stringify(users),
            error: err || null,
            nameOfUser: req.user.username
        });
    });




});


router.post('/update_user', isAuthenticated, function (req, res) {
    if (!req.user || !req.user.active || !req.user.password) {
        return res.redirect('/login?ref=security');
    }

    if (!req.body) {
        return res.send('missing body');
    }


    if (!req.body.username) {
        return res.send('missing username');

    }


    var operation = {
        "operation": "alter_user"

    };

    for (item in req.body) {
        if (item.indexOf('role') < 0)
            operation[item] = req.body[item];
        if (item === "role[id]") {
            operation["role"] = req.body[item];
        }
    }

    var call_object = {
        username: req.user.username,
        password: req.user.password,
        endpoint_url: req.user.endpoint_url,
        endpoint_port: req.user.endpoint_port

    };

    hdb_callout.callHarperDB(call_object, operation)
        .then(success => res.status(200).send(success))
        .catch(err => res.status(400).send(err))

});

router.get('/add_role', isAuthenticated, function (req, res) {
    var call_object = {
        username: req.user.username,
        password: req.user.password,
        endpoint_url: req.user.endpoint_url,
        endpoint_port: req.user.endpoint_port

    };
    var operation = {
        operation: "describe_all"
    }

    hdb_callout.callHarperDB(call_object, operation).then(result => {
        res.render('add_role', {
            schemas: result,
            flatenSchema: JSON.stringify(mapObject(result)),
            nameOfUser: req.user.username

        });

    });

});

router.post('/add_role', isAuthenticated, function (req, res) {
    var call_object = {
        username: req.user.username,
        password: req.user.password,
        endpoint_url: req.user.endpoint_url,
        endpoint_port: req.user.endpoint_port

    };
    hdb_callout.callHarperDB(call_object, JSON.parse(req.body.operationAddRole))
        .then(result => res.status(200).send(result))
        .catch(err => res.status(400).send(err))
});

router.post('/alter_role', isAuthenticated, function (req, res) {
    var call_object = {
        username: req.user.username,
        password: req.user.password,
        endpoint_url: req.user.endpoint_url,
        endpoint_port: req.user.endpoint_port

    };
    hdb_callout.callHarperDB(call_object, JSON.parse(req.body.operationEditRole))
        .then(result => res.status(200).send(result))
        .catch(err => res.status(400).send(err))
});

router.get('/add_user', isAuthenticated, function (req, res) {
    res.render('add_user', {
        nameOfUser: req.user.username
    });
});

router.get('/edit_role', isAuthenticated, function (req, res) {

    Promise.all([getSchemaAll(req, res), getListRole(req, res)]).then((resultArray) => {
        res.render('edit_role', {
            nameOfUser: req.user.username,
            schemas: resultArray[0],
            flatenSchema: JSON.stringify(mapObject(resultArray[0])),
            roles: resultArray[1]
        });
    })

});

router.post('/edit_user', isAuthenticated, function (req, res) {
    res.render('edit_user', {
        user: JSON.parse(req.body.user),
        nameOfUser: req.user.username
    });
});

router.post('/getalluser', isAuthenticated, function (req, res) {
    var connection = {
        username: req.user.username,
        password: req.user.password,
        endpoint_url: req.user.endpoint_url,
        endpoint_port: req.user.endpoint_port

    };
    var operation = {
        "operation": "list_users"
    }
    hdb_callout.callHarperDB(connection, operation)
        .then(user => res.status(200).send(user))
        .catch(err => res.status(400).send(err))
});

router.post('/getallrole', isAuthenticated, function (req, res) {
    var connection = {
        username: req.user.username,
        password: req.user.password,
        endpoint_url: req.user.endpoint_url,
        endpoint_port: req.user.endpoint_port

    };
    var operation = {
        "operation": "list_roles"
    }
    hdb_callout.callHarperDB(connection, operation)
        .then(roles => res.status(200).send(roles))
        .catch(err => res.status(400).send(err))
});

router.post('/add_user', isAuthenticated, function (req, res) {
    var connection = {
        username: req.user.username,
        password: req.user.password,
        endpoint_url: req.user.endpoint_url,
        endpoint_port: req.user.endpoint_port

    };
    var operation = {
        operation: "add_user",
        role: req.body.role,
        username: req.body.username,
        password: req.body.password,
        active: req.body.active

    }

    hdb_callout.callHarperDB(connection, operation)
        .then(message => res.status(200).send(message))
        .catch(err => res.status(400).send(err))
});

router.post('/drop_user', isAuthenticated, function (req, res) {
    var connection = {
        username: req.user.username,
        password: req.user.password,
        endpoint_url: req.user.endpoint_url,
        endpoint_port: req.user.endpoint_port

    };
    var operation = {
        operation: "drop_user",
        username: req.body.username
    }

    hdb_callout.callHarperDB(connection, operation)
        .then(message => res.status(200).send(message))
        .catch(err => res.status(400).send(err))
});

router.post('/drop_role', isAuthenticated, function (req, res) {
    var connection = {
        username: req.user.username,
        password: req.user.password,
        endpoint_url: req.user.endpoint_url,
        endpoint_port: req.user.endpoint_port

    };

    var operation = {
        operation: "drop_role",
        id: req.body.roleId
    }

    hdb_callout.callHarperDB(connection, operation)
        .then(message => res.status(200).send(message))
        .catch(err => res.status(400).send(err))
})

var getListRole = (req, res) => {
    return new Promise(resolve => {
        var connection = {
            username: req.user.username,
            password: req.user.password,
            endpoint_url: req.user.endpoint_url,
            endpoint_port: req.user.endpoint_port

        };
        var operation = {
            "operation": "list_roles"
        }
        hdb_callout.callHarperDB(connection, operation)
        .then(roles => res.status(200).send(roles))
        .catch(err => res.status(400).send(err))
    });
}

var getSchemaAll = (req, res) => {
    return new Promise((resolve, reject) => {
        var connection = {
            username: req.user.username,
            password: req.user.password,
            endpoint_url: req.user.endpoint_url,
            endpoint_port: req.user.endpoint_port

        };
        var operation = {
            "operation": "describe_all"
        }
        hdb_callout.callHarperDB(connection, operation)
            .then(schemas => resolve(schemas))
            .catch(err => reject(err))
    });
}

module.exports = router;