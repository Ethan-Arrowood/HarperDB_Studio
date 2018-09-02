const express = require("express"),
  router = express.Router(),
  hdb_callout = require("../utility/harperDBCallout"),
  isAuthenticated = require("../utility/checkAuthenticate").isAuthenticated,
  breadcrumb = require("../utility/breadcrumb"),
  sortSchemas = require("../utility/sortSchemas");

router.get("/", [isAuthenticated, breadcrumb], function(req, res) {
  req.session.preUrl = "/schema";
  const operation = {
    operation: "describe_all"
  };
  const call_object = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };

  hdb_callout
    .callHarperDB(call_object, operation)
    .then(allSchema =>
      res.render("schema", {
        schemas: sortSchemas(allSchema),
        user: req.user
      })
    )
    .catch(err => err);
});

router.post("/", isAuthenticated, async function(req, res) {
  const operation = {
    operation: "describe_all"
  };
  let operationAdd =
    req.body.addType == "schema"
      ? {
          operation: "create_schema",
          schema: req.body.schemaName
        }
      : {
          operation: "create_table",
          schema: req.body.schemaName,
          table: req.body.tableName,
          hash_attribute: req.body.hashAttribute
        };
  const call_object = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };

  try {
    const message = await hdb_callout.callHarperDB(call_object, operationAdd);
    const allSchema = await hdb_callout.callHarperDB(call_object, operation);

    return res.render("schema", {
      message: JSON.stringify(message),
      schemas: allSchema,
      user: req.user
    });
  } catch (err) {
    return err;
  }
});

router.get("/:schemaName", isAuthenticated, function(req, res) {
  const call_object = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };

  const operation = {
    operation: "describe_schema",
    schema: req.params.schemaName
  };

  hdb_callout
    .callHarperDB(call_object, operation)
    .then(schema =>
      res.render("schema_name", {
        schemaName: req.params.schemaName,
        schema: schema,
        user: req.user
      })
    )
    .catch(err => err);
});

router.post("/addtable/:schemaName", isAuthenticated, async function(req, res) {
  const operationAdd = {
    operation: "create_table",
    schema: req.params.schemaName,
    table: req.body.tableName,
    hash_attribute: req.body.hashAttribute
  };

  const call_object = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };

  const operation = {
    operation: "describe_schema",
    schema: req.params.schemaName
  };

  try {
    const message = await hdb_callout.callHarperDB(call_object, operationAdd);
    const schema = await hdb_callout.callHarperDB(call_object, operation);

    return res.render("schema_name", {
      schemaName: req.params.schemaName,
      schema: schema,
      message: JSON.stringify(message),
      user: req.user
    });
  } catch (err) {
    return err;
  }
});

router.post("/upload_csv/:schemaName", isAuthenticated, async function(
  req,
  res
) {
  const call_object = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };

  const operation = {
    operation: "describe_schema",
    schema: req.body.schemaName
  };
  let operationCSV = {
    schema: req.body.schemaName,
    table: req.body.tableName
  };

  if (req.body.csvType == "file") {
    operationCSV = {
      operation: "csv_file_load",
      file_path: req.body.csvPath
    };
  } else if (req.body.csvType == "url") {
    operationCSV = {
      operation: "csv_url_load",
      csv_url: req.body.csvUrl
    };
  } else {
    operationCSV = {
      operation: "csv_data_load",
      data: req.body.csvData
    };
  }

  try {
    const message = await hdb_callout.callHarperDB(call_object, operationCSV);
    const schema = await hdb_callout.callHarperDB(call_object, operation);

    return res.render("schema_name", {
      schemaName: req.params.schemaName,
      schema: schema,
      message: JSON.stringify(message),
      user: req.user
    });
  } catch (err) {
    return err;
  }
});

router.post("/delete", isAuthenticated, function(req, res) {
  const call_object = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };

  let operationdelete = {
    schema: req.body.schemaName
  };

  if (req.body.deleteType == "schema") {
    operationdelete = {
      operation: "drop_schema"
    };
  } else {
    operationdelete = {
      operation: "drop_table",
      table: req.body.tableName
    };
  }

  hdb_callout
    .callHarperDB(call_object, operationdelete)
    .then(schema => {
      if (req.body.deleteType == "schema") res.redirect("/schema");
      else res.redirect("/schema/" + req.body.schemaName);
    })
    .catch(err => err);
});

router.post("/records", isAuthenticated, function(req, res) {
  const call_object = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };
  const tableName = req.body.schemaName + "." + req.body.tableName;
  // var dotIndex = tableName.indexOf('.');
  // var sql = tableName.substr(0, dotIndex + 1) + "\"" + tableName.substr(dotIndex + 1) + "\"";

  const operation = {
    operation: "sql",
    sql: "SELECT COUNT(*) AS num FROM " + tableName
  };

  hdb_callout
    .callHarperDB(call_object, operation)
    .then(message => res.status(200).send(message))
    .catch(err => res.status(400).send(err));
});

router.post("/csv", isAuthenticated, async function(req, res) {
  const operation = {
    operation: "describe_all"
  };

  let operationCSV = {
    schema: req.body.schemaName,
    table: req.body.selectTableName
  };

  if (req.body.csvType == "file") {
    operationCSV.operation = "csv_file_load";
    operationCSV.file_path = req.body.csvPath;
  } else if (req.body.csvType == "url") {
    operationCSV.operation = "csv_url_load";
    operationCSV.csv_url = req.body.csvUrl;
  } else {
    operationCSV.operation = "csv_data_load";
    operationCSV.data = req.body.csvData;
  }

  const call_object = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };

  try {
    const message = await hdb_callout.callHarperDB(call_object, operationCSV);
    const allSchema = await hdb_callout.callHarperDB(call_object, operation);
    return res.render("schema", {
      message: JSON.stringify(message),
      schemas: allSchema,
      user: req.user
    });
  } catch (err) {
    return err;
  }
});

module.exports = router;
