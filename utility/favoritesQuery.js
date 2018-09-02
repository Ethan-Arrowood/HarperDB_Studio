const hdb_callout = require("./harperDBCallout");
const guid = require("guid");

const setFavorites = async function(req, res, favoriteObj) {
  const call_object = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };

  const record = {
    sql: favoriteObj.sql,
    name: favoriteObj.name,
    note: favoriteObj.note,
    username: req.user.username,
    date: new Date(),
    id: guid.create()
  };

  const operation = {
    operation: "insert",
    schema: "harperdb_studio",
    table: "query",
    records: [record]
  };

  try {
    let result = await hdb_callout.callHarperDB(call_object, operation);
    if (result.error) {
      await createTable(req, res, "query");
      result = await hdb_callout.callHarperDB(call_object, operation);
    }
    return result;
  } catch (err) {
    return err; // UH E
  }
};
const setLiveLink = async function(req, res, en_url, id) {
  const call_object = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };

  const record = {
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
  };

  const operation = {
    operation: "insert",
    schema: "harperdb_studio",
    table: "livelink",
    records: [record]
  };

  try {
    let result = await hdb_callout.callHarperDB(call_object, operation);
    if (result.error) {
      await createTable(req, res, "livelink");
      result = await hdb_callout.callHarperDB(call_object, operation);
    }
    return result;
  } catch (err) {
    return err; // UH E
  }
};

const updateLiveLink = function(req, id) {
  return new Promise(function(resolve, reject) {
    const call_object = {
      username: req.user.username,
      password: req.user.password,
      endpoint_url: req.user.endpoint_url,
      endpoint_port: req.user.endpoint_port
    };

    const record = {
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
    };

    const operation = {
      operation: "update",
      schema: "harperdb_studio",
      table: "livelink",
      records: [record]
    };

    hdb_callout
      .callHarperDB(call_object, operation)
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
};

const getFavorites = async function(req, res) {
  const call_object = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };

  const operation = {
    operation: "sql",
    sql:
      "SELECT * FROM harperdb_studio.query WHERE username = '" +
      req.user.username +
      "' ORDER BY date DESC  LIMIT 10"
  };

  try {
    let result = await hdb_callout.callHarperDB(call_object, operation);
    if (result.error) {
      await createTable(req, res, "query");
      result = await hdb_callout.callHarperDB(call_object, operation);
    }
    return result;
  } catch (err) {
    return err; // UH E
  }
};

const getLivelink = async function(req, res) {
  const call_object = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };

  const operation = {
    operation: "sql",
    sql:
      "SELECT * FROM harperdb_studio.livelink WHERE username = '" +
      req.user.username +
      "' ORDER BY date DESC  LIMIT 10"
  };

  try {
    let result = await hdb_callout.callHarperDB(call_object, operation);
    if (result.error) {
      await createTable(req, res, "livelink");
      result = await hdb_callout.callHarperDB(call_object, operation);
    }
    return result;
  } catch (err) {
    return err; // UH E
  }
};

const getLivelinkById = function(req, id) {
  return new Promise(function(resolve, reject) {
    const call_object = {
      username: req.user.username,
      password: req.user.password,
      endpoint_url: req.user.endpoint_url,
      endpoint_port: req.user.endpoint_port
    };

    const operation = {
      operation: "sql",
      sql: "SELECT * FROM harperdb_studio.livelink WHERE id = '" + id + "'"
    };

    hdb_callout
      .callHarperDB(call_object, operation)
      .then(result => {
        if (err || result.error) resolve(result);
        else if (result.length > 0) resolve(result[0]);
        else resolve(result);
      })
      .catch(err => reject(err));
  });
};

const createTable = async function(req, res, tableType) {
  const call_object = {
    username: req.user.username,
    password: req.user.password,
    endpoint_url: req.user.endpoint_url,
    endpoint_port: req.user.endpoint_port
  };

  const operation = {
    operation: "create_table",
    schema: "harperdb_studio",
    table: tableType,
    hash_attribute: "id"
  };

  try {
    await createFavoriteSearchSchema(req, res);
    let result = await hdb_callout.callHarperDB(call_object, operation);
    resovle(result);
  } catch (err) {
    reject(err);
  }
};

const createFavoriteSearchSchema = function(req) {
  return new Promise(function(resolve) {
    const call_object = {
      username: req.user.username,
      password: req.user.password,
      endpoint_url: req.user.endpoint_url,
      endpoint_port: req.user.endpoint_port
    };

    const operation = {
      operation: "create_schema",
      schema: "harperdb_studio"
    };

    hdb_callout
      .callHarperDB(call_object, operation)
      .then(result => {
        if (result.error) throw new Error(result.error);
        resolve(result);
      })
      .catch(err => reject(err));
  });
};

module.exports = {
  setFavorites: setFavorites,
  createFavoriteSearchSchema: createFavoriteSearchSchema,
  createUserFavoriteTable: createTable,
  getFavorites: getFavorites,
  setLiveLink: setLiveLink,
  getLivelink: getLivelink,
  getLivelinkById: getLivelinkById,
  updateLiveLink: updateLiveLink
};
