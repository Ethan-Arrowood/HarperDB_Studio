const express = require("express"),
  router = express.Router(),
  hdb_callout = require("../utility/harperDBCallout"),
  isAuthenticated = require("../utility/checkAuthenticate").isAuthenticated,
  isSuperAdmin = require("../utility/checkAuthenticate").isSuperAdmin,
  mapObject = require("../utility/mapDescribeAllToAddRole");

router.get("/", [isAuthenticated, isSuperAdmin], function(req, res) {
  const operation = {
    operation: "list_users"
  };
  const call_object = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };

  hdb_callout
    .callHarperDB(call_object, operation)
    .then(users => {
      return res.render("security", {
        user: req.user,
        users: JSON.stringify(users)
      });
    })
    .catch(err =>
      res.render("user_detail", {
        user: req.user,
        detail_user: {},
        error: err,
        user: req.user
      })
    );
});

router.post("/update_user_active", [isAuthenticated, isSuperAdmin], function(
  req,
  res
) {
  const operation = {
    operation: "alter_user",
    username: req.body.username,
    active: JSON.parse(req.body.active)
  };

  const call_object = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };

  hdb_callout
    .callHarperDB(call_object, operation)
    .then(success => res.status(200).send(success))
    .catch(err => res.status(400).send(err));
});

router.post("/update_user_password", [isAuthenticated, isSuperAdmin], function(
  req,
  res
) {
  const operation = {
    operation: "alter_user",
    username: req.body.username,
    password: req.body.password
  };

  const call_object = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };

  hdb_callout
    .callHarperDB(call_object, operation)
    .then(success => res.status(200).send(success))
    .catch(err => res.status(400).send(err));
});

router.get("/add_role", [isAuthenticated, isSuperAdmin], function(req, res) {
  const call_object = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };
  const operation = {
    operation: "describe_all"
  };

  hdb_callout
    .callHarperDB(call_object, operation)
    .then(result =>
      res.render("add_role", {
        schemas: result,
        flatenSchema: JSON.stringify(mapObject(result)),
        user: req.user
      })
    )
    .catch(err => {
      throw new Error({
        message: "Unhandeled error in security.js",
        error: err
      });
    });
});

router.post("/add_role", [isAuthenticated, isSuperAdmin], function(req, res) {
  const call_object = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };

  hdb_callout
    .callHarperDB(call_object, JSON.parse(req.body.operationAddRole))
    .then(result => res.status(200).send(result))
    .catch(err => res.status(400).send(err));
});

router.post("/alter_role", [isAuthenticated, isSuperAdmin], function(req, res) {
  const call_object = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };
  hdb_callout
    .callHarperDB(call_object, JSON.parse(req.body.operationEditRole))
    .then(result => res.status(200).send(result))
    .catch(err => res.status(400).send(err));
});

router.get("/add_user", [isAuthenticated, isSuperAdmin], function(req, res) {
  res.render("add_user", {
    user: req.user
  });
});

router.get("/edit_role", [isAuthenticated, isSuperAdmin], function(req, res) {
  Promise.all([getSchemaAll(req, res), getListRole(req, res)]).then(
    resultArray => {
      res.render("edit_role", {
        user: req.user,
        schemas: resultArray[0],
        flatenSchema: JSON.stringify(mapObject(resultArray[0])),
        roles: resultArray[1]
      });
    }
  );
});

router.post("/edit_user", [isAuthenticated, isSuperAdmin], function(req, res) {
  res.render("edit_user", {
    user: JSON.parse(req.body.user)
  });
});

router.post("/getalluser", [isAuthenticated, isSuperAdmin], function(req, res) {
  const connection = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };
  const operation = {
    operation: "list_users"
  };
  hdb_callout
    .callHarperDB(connection, operation)
    .then(result => res.status(200).send(result))
    .catch(err => res.status(400).send(err));
});

router.post("/getallrole", [isAuthenticated, isSuperAdmin], function(req, res) {
  const connection = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };
  const operation = {
    operation: "list_roles"
  };
  hdb_callout
    .callHarperDB(connection, operation)
    .then(result => res.status(200).send(result))
    .catch(err => res.status(400).send(err));
});

router.post("/add_user", [isAuthenticated, isSuperAdmin], function(req, res) {
  const connection = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };
  const operation = {
    operation: "add_user",
    role: req.body.role,
    username: req.body.username,
    password: req.body.password,
    active: req.body.active
  };

  hdb_callout
    .callHarperDB(connection, operation)
    .then(result => res.status(200).send(result))
    .catch(err => res.status(400).send(err));
});

router.post("/drop_user", [isAuthenticated, isSuperAdmin], function(req, res) {
  const connection = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };
  const operation = {
    operation: "drop_user",
    username: req.body.username
  };

  hdb_callout
    .callHarperDB(connection, operation)
    .then(result => res.status(200).send(result))
    .catch(err => res.status(400).send(err));
});

router.post("/drop_role", [isAuthenticated, isSuperAdmin], function(req, res) {
  const connection = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };

  const operation = {
    operation: "drop_role",
    id: req.body.roleId
  };

  hdb_callout
    .callHarperDB(connection, operation)
    .then(result => res.status(200).send(result))
    .catch(err => res.status(400).send(err));
});

var getListRole = (req, res) => {
  return new Promise((resolve, reject) => {
    const connection = {
      username: req.user.username,
      password: req.user.password,
      endpoint_url: req.user.endpoint_url,
      endpoint_port: req.user.endpoint_port
    };
    const operation = {
      operation: "list_roles"
    };
    hdb_callout
      .callHarperDB(connection, operation)
      .then(roles => resolve(roles))
      .catch(err => reject(err));
  });
};

var getSchemaAll = (req, res) => {
  return new Promise((resolve, reject) => {
    const connection = {
      username: req.user.username,
      password: req.user.password,
      endpoint_url: req.user.endpoint_url,
      endpoint_port: req.user.endpoint_port
    };
    const operation = {
      operation: "describe_all"
    };
    hdb_callout
      .callHarperDB(connection, operation)
      .then(schemas => resolve(schemas))
      .catch(err => reject(err));
  });
};

module.exports = router;
